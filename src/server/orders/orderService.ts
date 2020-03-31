import { refetchAccessToken } from '../../utils/auth'
import { IncomingMessage, OutgoingMessage } from 'http';
import { IAddress } from './../../place/addressModel';
import { EOrder, IOrder, IUpdateOrderInput } from './../../order/orderModel';
import { IMeal } from './../../rest/mealModel';
import { getPlanService, IPlanService } from './../plans/planService';
import { EConsumer, CuisineType, IConsumerPlan, IConsumerProfile, deliveryTime } from './../../consumer/consumerModel';
import { SignedInUser, MutationBoolRes, MutationConsumerRes } from '../../utils/apolloUtils';
import { getConsumerService, IConsumerService } from './../consumer/consumerService';
import { ICartInput, Cart, ICartMeal } from './../../order/cartModel';
import { getGeoService, IGeoService } from './../place/geoService';
import { getRestService, IRestService } from './../rests/restService';
import { getCannotBeEmptyError, getNotSignedInErr } from './../utils/error';
import { initElastic, SearchResponse } from './../elasticConnector';
import { Client, ApiResponse } from '@elastic/elasticsearch';
import { Order } from '../../order/orderModel';
import Stripe from 'stripe';
import { activeConfig } from '../../config';
import { Consumer, IConsumer } from '../../consumer/consumerModel';
import moment from 'moment';
import { isDate2DaysLater } from '../../order/utils';

const ORDER_INDEX = 'orders';
export const getAdjustmentDesc = (fromPlanCount: number, toPlanCount: number, date: string) =>
  `Plan adjustment from ${fromPlanCount} to ${toPlanCount} for week of ${date}`
export const adjustmentDateFormat = 'M/D/YY';

const chooseRandomMeals = (menu: IMeal[], mealCount: number) => {
  const chooseRandomly = getItemChooser<IMeal>(menu);
  const meals: IMeal[] = [];
  for (let i = 0; i < mealCount; i++) meals.push(chooseRandomly())
  return Cart.getCartMeals(meals);
}

/**
 * Returns a fn, Chooser, that returns a random element in arr. Chooser always returns unique elements until all uniques
 * are returned at which point the chooser "resets". Upon a reset, Chooser returns another cycle of unique elements.
 * Therefore repeat values only occur from mulitple cycles.
 * @param arr the array which contains items to be chosen
 */
const getItemChooser = <T>(arr: T[]) => {
  let copy = arr.slice(0);
  return () => {
    if (copy.length < 1) {
      copy = arr.slice(0);
    }
    const index = Math.floor(Math.random() * copy.length);
    return copy.splice(index, 1)[0];
  };
}

const validatePhone = (phone: string) => {
  if (!phone) {
    const msg = getCannotBeEmptyError('Phone number');
    console.warn('[OrderService]', msg);
    return msg;
  }
}

const validateDeliveryDate = (date: number, now = Date.now()) => {
  if (!isDate2DaysLater(date, now)) {
    console.warn('[OrderService]', `Delivery date '${date}' is not 2 days in advance`);
    return `Delivery date '${moment(date).format(adjustmentDateFormat)}' is not 2 days in advance`;
  }
}

const getUpcomingOrdersQuery = (signedInUserId: string) => ({
  bool: {
    filter: {
      bool: {
        must: [
          {
            range: {
              deliveryDate: {
                gte: Date.now(),
              }
            },
          },
          {
            term: {
              'consumer.userId': signedInUserId
            }
          }
        ]
      }
    }
  }
})

const removeMealsRandomly = (meals: ICartMeal[], numMealsToRemove: number) => {
  const chooseRandomly = getItemChooser<ICartMeal>(meals);
  for (let i = 0; i < numMealsToRemove; i++) {
    let randomMeal = chooseRandomly();
    let targetIndex = meals.findIndex(m => m.mealId === randomMeal.mealId);
    while (targetIndex === -1) {
      // this is possible if the randomly chosen meal was already removed from meals
      randomMeal = chooseRandomly();
      targetIndex = meals.findIndex(m => m.mealId === randomMeal.mealId);
    }
    const targetMeal = meals[targetIndex];
    if (targetMeal.quantity === 1) {
      meals.splice(targetIndex, 1);
    } else {
      meals[targetIndex] = {
        ...targetMeal,
        quantity: targetMeal.quantity - 1,
      };
    }
  }
}

export interface IOrderService {
  addAutomaticOrder(
    consumer: IConsumer,
    iDate: number,
    mealCount: number,
    weekPrice: number,
    mealPrice: number
  ): Promise<void>
  placeOrder(
    signedInUser: SignedInUser,
    cart: ICartInput,
    req?: IncomingMessage,
    res?: OutgoingMessage,
  ): Promise<MutationConsumerRes>
  getMyUpcomingEOrders(signedInUser: SignedInUser): Promise<{ _id: string, order: EOrder }[]>
  getMyUpcomingIOrders(signedInUser: SignedInUser): Promise<IOrder[]>
  updateOrder(
    signedInUser: SignedInUser,
    orderId: string,
    updateOptions: IUpdateOrderInput,
    now?: number,
  ): Promise<MutationBoolRes>
  updateUpcomingOrdersPlans(
    signedInUser: SignedInUser,
    mealPrice: number,
    total: number,
    mealCount: number,
    plan: IConsumerPlan,
    updatedDate?: number,
  ): Promise<(ApiResponse<any, any>)[]>
  updateUpcomingOrdersProfile(signedInUser: SignedInUser, profile: IConsumerProfile): Promise<MutationBoolRes>,
}

class OrderService {
  private readonly elastic: Client
  private readonly stripe: Stripe
  private geoService?: IGeoService;
  private planService?: IPlanService;
  private consumerService?: IConsumerService;
  private restService?: IRestService;

  public constructor(
    elastic: Client,
    stripe: Stripe,
  ) {
    this.elastic = elastic;
    this.stripe = stripe;
  }

  public setGeoService(geoService: IGeoService) {
    this.geoService = geoService;
  }
  public setPlanService(planService: IPlanService) {
    this.planService = planService;
  }

  public setConsumerService(consumerService: IConsumerService) {
    this.consumerService = consumerService;
  }

  public setRestService(restService: IRestService) {
    this.restService = restService;
  }

  private async chooseRandomRestAndMeals(cuisines: CuisineType[], mealCount: number) {
    try {
      if (!this.restService) throw new Error('No rest service');
      const rests = await this.restService.getRestsByCuisines(cuisines, ['menu'])
      if (rests.length === 0) throw new Error(`Rests of cuisine '${JSON.stringify(cuisines)}' is empty`)
      const rest = rests[Math.floor(Math.random() * rests.length)];
      return {
        restId: rest._id,
        meals: chooseRandomMeals(rest.menu, mealCount),
      };
    } catch (e) {
      console.error(`[OrderService] could not auto pick rests and meals`, e.stack)
      throw e;
    }
  }

  private validateRest(restId: string, meals: ICartMeal[]) {
    if (!this.restService) return Promise.reject('RestService not set');
    return this.restService.getRest(restId, ['menu'])
      .then(rest => {
        if (!rest) {
          const msg = `Can't find rest '${restId}'`
          console.warn('[OrderService]', msg);
          return msg;
        }
        for (let i = 0; i < meals.length; i++) {
          if (!rest.menu.find(meal => meal._id === meals[i].mealId)) {
            const msg = `Can't find mealId '${meals[i].mealId}'`
            console.warn('[OrderService]', msg);
            return msg;
          }
        }
        return '';
      }).catch(e => {
        const msg = `Couldn't find rest '${restId}'`
        console.warn('[OrderService]', msg, e.stack);
        return msg;
      });
  }

  private validateAddress({
    address1,
    city,
    state,
    zip,
  }: IAddress) {
    if (!this.geoService) return Promise.reject('GeoService not set');
    return this.geoService.getGeocode(address1, city, state, zip)
    .then(() => '')  
    .catch(e => {
      const msg = `Couldn't verify address '${address1} ${city} ${state}, ${zip}'`
      console.warn('[OrderService]', msg, e.stack);
      return msg;
    });
  } 

  private validatePlan(planId: string, cartMealCount: number) {
    if (!this.planService) return Promise.reject('PlanService not set');
    return this.planService.getPlan(planId)
      .then(stripePlan => {
        if (!stripePlan) {
          const msg = `Can't find plan '${planId}'`
          console.warn('[OrderService]', msg);
          return msg;
        }
        if (cartMealCount !== stripePlan.mealCount) {
          const msg = `Plan meal count '${stripePlan.mealCount}' does't match cart meal count '${cartMealCount}' for plan '${planId}'`
          console.warn('[OrderService]', msg);
          return msg;
        }
        return '';
      })
      .catch(e => {
        const msg = `Couldn't verify plan '${planId}'`
        console.warn('[OrderService]', msg, e.stack);
        return msg;
      })
  }

  private async validateCart(cart: ICartInput) {
    const phoneValidation = validatePhone(cart.phone);
    if (phoneValidation) return phoneValidation;
    const deliveryDateValidation = validateDeliveryDate(cart.deliveryDate);
    if (deliveryDateValidation) return deliveryDateValidation;

    if (!Consumer.isDeliveryDayValid(cart.consumerPlan.deliveryDay)) {
      const msg = `Delivery day '${cart.consumerPlan.deliveryDay}' must be 0, 1, 2, 3, 4, 5, 6`;
      console.warn('[OrderService]', msg);
      return msg;
    }

    if (cart.consumerPlan.cuisines.length === 0) {
      const msg = 'Cuisines cannot be empty';
      console.warn('[OrderService]', msg);
      return msg;
    }
    let p1;
    if (cart.restId) p1 = this.validateRest(cart.restId, cart.meals);
    const p2 = this.validateAddress(cart.destination.address);
    const p3 = this.validatePlan(cart.consumerPlan.stripePlanId, Cart.getMealCount(cart.meals) + cart.donationCount);

    const messages = await Promise.all([p1, p2, p3]);
    if (messages[0]) {
      return messages[0]
    }
    if (messages[1]) {
      return messages[1]
    }
    if (messages[2]) {
      return messages[2]
    }

    return '';
  }

  private async validateUpdateOrderInput(updateOptions: IUpdateOrderInput, now: number) {
    if (!this.planService) return Promise.reject('PlanService not set');
    const phoneValidation = validatePhone(updateOptions.phone);
    if (phoneValidation) return phoneValidation;
    const deliveryDateValidation = validateDeliveryDate(updateOptions.deliveryDate, now);
    if (deliveryDateValidation) return deliveryDateValidation;

    let p1 = Promise.resolve('');
    if (updateOptions.restId) {
      p1 = this.validateRest(updateOptions.restId, updateOptions.meals);
    }
    const p2 = this.validateAddress(updateOptions.destination.address);
    let p3 = Promise.resolve('');
    const mealCount = Cart.getMealCount(updateOptions.meals) + updateOptions.donationCount;
    if (mealCount > 0) {
      p3 = this.planService.getPlanByCount(mealCount)
        .then(plan => {
          if (!plan) {
            const msg = `Can't find plan with meal count '${mealCount}'`
            console.warn('[OrderService]', msg);
            return msg;
          }
          return '';
        })
        .catch(e => {
          const msg = `Failed getPlanByCount with meal count '${mealCount}'`;
          console.warn('[OrderService]', msg, e.stack);
          return msg;
        });
    }

    const messages = await Promise.all([p1, p2, p3]);
    if (messages[0]) {
      return messages[0]
    }
    if (messages[1]) {
      return messages[1]
    }
    if (messages[2]) {
      return messages[2]
    }
  }

  private async getOrder(orderId: string, fields?: string[]) {
    const options: any = {
      index: ORDER_INDEX,
      id: orderId,
    };
    if (fields) options._source = fields;
    try {
      const res: ApiResponse<EOrder> = await this.elastic.getSource(options);
      return res.body;
    } catch (e) {
      console.error(`[OrderService] failed to get order '${orderId}'`, e.stack);
      return null;
    }
  }

  public async addAutomaticOrder(
    consumer: IConsumer,
    iDate: number,
    mealCount: number,
    weekPrice: number,
    mealPrice: number
  ) {
    try {
      if (!consumer.plan) throw new Error(`Missing consumer plan for consumer '${consumer._id}'`);
      if (!consumer.stripeSubscriptionId) throw new Error(`Missing subscriptionId for consumer '${consumer._id}'`);
      const rest = await this.chooseRandomRestAndMeals(consumer.plan.cuisines, mealCount);
      const now = Date.now();
      const eOrder: EOrder = {
        cartUpdatedDate: now,
        consumer: {
          userId: consumer._id,
          profile: consumer.profile,
        },
        costs: {
          tax: 0,
          tip: 0,
          mealPrice,
          total: weekPrice,
          percentFee: 0,
          flatRateFee: 0,
        },
        createdDate: now,
        invoiceDate: iDate,
        deliveryDate: moment(iDate).add(2, 'd').valueOf(),
        rest,
        status: 'Open',
        stripeSubscriptionId: consumer.stripeSubscriptionId,
        deliveryTime: consumer.plan.deliveryTime,
        donationCount: 0
      }
      await this.elastic.index({
        index: ORDER_INDEX,
        body: eOrder
      });
    } catch (e) {
      console.error(`[OrderService] failed to addAutomaticOrder for consumer ${consumer._id} and invoiceDate ${iDate}`, e.stack);
      throw new Error('Internal Server Error');
    }
  }

  public async placeOrder(
    signedInUser: SignedInUser,
    cart: ICartInput,
    req?: IncomingMessage,
    res?: OutgoingMessage,
  ): Promise<MutationConsumerRes> {
    if (!signedInUser) throw getNotSignedInErr()
    try {
      if (!this.consumerService) throw new Error ('ConsumerService not set');
      if (!this.restService) throw new Error ('RestService not set');

      const validation = await this.validateCart(cart);
      if (validation) {
        return {
          res: null,
          error: validation
        }
      }

      const {
        deliveryDay,
        cuisines,
        stripePlanId,
        deliveryTime,
      } = cart.consumerPlan;

      let stripeCustomerId = signedInUser.stripeCustomerId;
      let subscription: Stripe.Subscription;
      const invoiceDateSeconds = Math.round(moment(cart.deliveryDate).subtract(2, 'd').valueOf() / 1000)
      if (signedInUser.stripeSubscriptionId) {
        const msg = `Subscription '${signedInUser.stripeSubscriptionId}' already exists`;
        console.warn('[OrderService]', msg)
        return {
          res: null,
          error: msg
        }
      }

      if (!stripeCustomerId) {
        try {
          const stripeCustomer = await this.stripe.customers.create({
            payment_method: cart.paymentMethodId,
            email: signedInUser.profile.email,
            invoice_settings: {
              default_payment_method: cart.paymentMethodId,
            },
          });
          stripeCustomerId = stripeCustomer.id;
        } catch (e) {
          console.error(`Failed to create stripe customer for consumer '${signedInUser._id}'`, e.stack);
          throw e;
        }
      }
      try {
        subscription = await this.stripe.subscriptions.create({
          proration_behavior: 'none',
          billing_cycle_anchor: invoiceDateSeconds,
          customer: stripeCustomerId,
          // fails on any id that isn't an active stripe plan
          items: [{ plan: stripePlanId }]
        });
      } catch (e) {
        console.error(`Failed to create stripe subscription for consumer '${signedInUser._id}'`
                      + `with stripe customerId '${stripeCustomerId}'`, e.stack);
        throw e;
      }

      const order = Order.getNewOrderFromCartInput(
        signedInUser,
        cart,
        invoiceDateSeconds * 1000,
        subscription.id,
        parseFloat(subscription.plan!.metadata.mealPrice),
        subscription.plan!.amount! / 100,
      );
      const indexer = this.elastic.index({
        index: ORDER_INDEX,
        body: order
      })
      const consumer: EConsumer = {
        createdDate: Date.now(),
        stripeCustomerId,
        stripeSubscriptionId: subscription.id,
        plan: {
          stripePlanId,
          deliveryDay,
          deliveryTime,
          cuisines,
        },
        profile: {
          name: signedInUser.profile.name,
          email: signedInUser.profile.email,
          phone: cart.phone,
          card: cart.card,
          destination: cart.destination,
        }
      };
      const consumerUpserter = this.consumerService.upsertConsumer(signedInUser._id, consumer);
      const consumerAuth0Updater = this.consumerService.updateAuth0MetaData(signedInUser._id, subscription.id, stripeCustomerId);

      const nextDeliveryDate = moment(cart.deliveryDate).add(1, 'w').valueOf();
      // divide by 1000, then mulitply by 1000 to keep calculation consistent with how invoiceDate is calculated for the
      // placed order
      const nextInvoice = Math.round(moment(nextDeliveryDate).subtract(2, 'd').valueOf() / 1000) * 1000;
      this.chooseRandomRestAndMeals(cart.consumerPlan.cuisines, Cart.getMealCount(cart.meals) + cart.donationCount)
        .then(({ restId, meals }) => {
          const newCart: ICartInput = {
            ...cart,
            donationCount: 0,
            restId: restId,
            meals,
            deliveryDate: nextDeliveryDate
          }

          const order = Order.getNewOrderFromCartInput(
            signedInUser,
            newCart,
            nextInvoice,
            subscription.id,
            parseFloat(subscription.plan!.metadata.mealPrice),
            subscription.plan!.amount! / 100,
          );
          return this.elastic.index({
            index: ORDER_INDEX,
            body: order
          })
        })
        .catch(e => {
          console.error('[OrderService] could not auto pick rests', e.stack);
        })

      await Promise.all([consumerUpserter, indexer, consumerAuth0Updater]);
      if (req && res) await refetchAccessToken(req, res);
      return {
        res: Consumer.getIConsumerFromEConsumer(signedInUser._id, consumer),
        error: null
      };
    } catch (e) {
      console.error('[OrderService] could not place order', e.stack);
      throw new Error('Internal Server Error');
    }
  }

  async getMyUpcomingEOrders(signedInUser: SignedInUser): Promise<{ _id: string, order: EOrder }[]> {
    if (!signedInUser) throw getNotSignedInErr()
    try {
      const res: ApiResponse<SearchResponse<EOrder>> = await this.elastic.search({
        index: ORDER_INDEX,
        size: 1000,
        body: {
          query: getUpcomingOrdersQuery(signedInUser._id),
          sort: [
            {
              deliveryDate: {
                order: 'asc',
              }
            }
          ],
        }
      });
      return res.body.hits.hits.map(({ _id, _source }) => ({
        _id,
        order: _source,
      }));
    } catch (e) {
      console.error(`[OrderService] couldn't get upcoming EOrders for consumer '${signedInUser._id}'. '${e.stack}'`);
      throw new Error('Internal Server Error');
    }
  }

  async getMyUpcomingIOrders(signedInUser: SignedInUser): Promise<IOrder[]> {
    if (!signedInUser) throw getNotSignedInErr()
    try {
      const res = await this.getMyUpcomingEOrders(signedInUser);
      return await Promise.all(res.map(async ({ _id, order }) => {
        if (!this.restService) throw new Error ('RestService not set');
        if (order.rest.restId) {
          const rest = await this.restService.getRest(order.rest.restId)
          if (!rest) throw Error(`Couldn't get rest ${order.rest.restId}`);
          return Order.getIOrderFromEOrder(_id, order, rest);
        }
        return Order.getIOrderFromEOrder(_id, order, null)
      }))
    } catch (e) {
      console.error(`[OrderService] couldn't get upcoming IOrders for consumer '${signedInUser._id}'. '${e.stack}'`);
      throw new Error('Internal Server Error');
    }
  }

  async updateOrder(
    signedInUser: SignedInUser,
    orderId: string,
    updateOptions: IUpdateOrderInput,
    now = Date.now(),
  ): Promise<MutationBoolRes> {
    try {
      if (!signedInUser) throw getNotSignedInErr()
      if (!this.planService) throw new Error ('RestService not set');
      const stripeCustomerId = signedInUser.stripeCustomerId;
      const subscriptionId = signedInUser.stripeSubscriptionId
      if (!stripeCustomerId) {
        const msg = 'Missing stripe customer id';
        console.warn('[OrderService]', msg)
        return {
          res: false,
          error: msg
        }
      }
      if (!subscriptionId) {
        const msg = 'Missing subscription id';
        console.warn('[OrderService]', msg)
        return {
          res: false,
          error: msg
        }
      }
      if (!orderId) {
        const msg = `No order id user`;
        console.warn('[OrderService]', msg)
        return {
          res: false,
          error: msg
        }
      }
      const validation = await this.validateUpdateOrderInput(updateOptions, now);
      if (validation) {
        return {
          res: false,
          error: validation
        };
      }

      const targetOrder = await this.getOrder(orderId);
      if (!targetOrder) throw new Error(`Couldn't get order '${orderId}'`);

      if (targetOrder.consumer.userId !== signedInUser._id) {
        const msg = 'Can only update your own orders';
        console.warn(
          '[OrderService]',
          `${msg}. targerOrder consonsumer '${targetOrder.consumer.userId}', signedInUser '${signedInUser._id}'`
        )
        return {
          res: false,
          error: msg
        }
      }

      if (targetOrder.status !== 'Open' && targetOrder.status !== 'Skipped') {
        const msg = `Trying to update order with status '${targetOrder.status}'. Can only update 'Open' or 'Skipped' orders.`;
        console.warn(`[OrderService] ${msg}`);
        return {
          res: false,
          error: msg
        }
      }

      const targetOrderInvoiceDate = targetOrder.invoiceDate
      if (updateOptions.deliveryDate > moment(targetOrderInvoiceDate).add(8, 'd').valueOf()) {
        const msg = 'Delivery date cannot exceed 8 days after the payment';
        console.warn('[OrderService]', msg)
        return {
          res: false,
          error: msg
        }
      }

      const targetOrderInvoiceDateDisplay = moment(targetOrderInvoiceDate).format(adjustmentDateFormat);
      let pendingLineItems;
      try {
        pendingLineItems = await this.stripe.invoiceItems.list({
          limit: 50,
          pending: true,
          customer: stripeCustomerId,
        });
      } catch (e) {
        throw new Error(`Couldn't get future line items'. ${e.stack}`)
      }

      const targetAdjustment = pendingLineItems.data.find(line => line.description && line.description.includes(targetOrderInvoiceDateDisplay))
      if (targetAdjustment) {
        try {
          await this.stripe.invoiceItems.del(targetAdjustment.id);
        } catch (e) {
          throw new Error (`Couldn't remove previous adjustment. ${e.stack}`)
        }
      }

      let originalPrice;
      let prevInvoices;
      try {
        prevInvoices = await this.stripe.invoices.list({
          limit: 1,
          customer: stripeCustomerId
        });
      } catch (e) {
        throw new Error (`Couldn't get previous invoices for consumer '${stripeCustomerId}'. ${e.stack}`)
      }
      const prevInvoice = prevInvoices.data[0];
      let prevAdjustmentLine;
      // no prev invoice if it's a new subscription
      if (prevInvoice) {
        prevAdjustmentLine = prevInvoice.lines.data.find(line => line.description && line.description.includes(targetOrderInvoiceDateDisplay))
      } 
      const prevAdjustment = prevAdjustmentLine ? prevAdjustmentLine.amount : 0;
      // is the consumer updating an unpaid week?
      if (now < targetOrderInvoiceDate) {
        const upcomingLineItems = await this.stripe.invoices.listUpcomingLineItems({ subscription: subscriptionId });
        const upcomingPlan = upcomingLineItems.data.find(line => !!line.plan);
        if (!upcomingPlan) throw new Error (`Could not find plan in future line items for consumer '${stripeCustomerId}'`);
        originalPrice = upcomingPlan.amount + prevAdjustment;
      } else {
        const prevPlanLine = prevInvoice.lines.data.find(line => !!line.plan)
        if (!prevPlanLine) throw new Error(`Couldn't get previous plan for consumer '${stripeCustomerId}' in invoice '${prevInvoice.id}'`);
        originalPrice = prevPlanLine.amount + prevAdjustment;
      }
      let newPlan;
      let amount;
      const mealCount = Cart.getMealCount(updateOptions.meals) + updateOptions.donationCount;
      if (mealCount > 0) {
        newPlan = await this.planService.getPlanByCount(mealCount);
        if (!newPlan) throw new Error(`Couldn't get plan from meal count '${mealCount}'`);
        amount = newPlan.weekPrice * 100 - originalPrice;
      } else {
        amount = 0 - originalPrice;
      }
      if (amount !== 0) {
        try {
          await this.stripe.invoiceItems.create({
            amount,
            currency: 'usd',
            customer: stripeCustomerId,
            description: getAdjustmentDesc(
              Cart.getMealCount(targetOrder.rest.meals) + targetOrder.donationCount,
              newPlan ? newPlan.mealCount : 0,
              targetOrderInvoiceDateDisplay
            ),
            subscription: subscriptionId,
          });
        } catch (e) {
          throw new Error(
            `Couldn't create invoice item for amount '${amount}', and invoice date '${targetOrderInvoiceDateDisplay}'. ${e.stack}`
          )
        }
      }
      
      try {
        await this.elastic.update({
          index: ORDER_INDEX,
          id: orderId,
          body: {
            doc: Order.getEOrderFromUpdatedOrder(
              targetOrder,
              newPlan ? newPlan.mealPrice : null,
              newPlan ? newPlan.weekPrice : 0,
              updateOptions
            ),
          }
        })
      } catch (e) {
        throw new Error(`Couldn't update elastic order '${orderId}'. ${e.stack}`)
      }

      return {
        res: true,
        error: null,
      }
    } catch (e) {
      console.error(`[OrderService] couldn't updateOrder for '${orderId}' with updateOptions '${JSON.stringify(updateOptions)}'`, e.stack);
      throw new Error('Internal Server Error');
    }
  }

  async updateUpcomingOrdersPlans(
    signedInUser: SignedInUser,
    mealPrice: number,
    total: number,
    targetMealCount: number,
    plan: IConsumerPlan,
    nextDeliveryDate: number,
    updatedDate: number = Date.now(),
  ) {
    try {
      if (!signedInUser) throw getNotSignedInErr();
      if (validateDeliveryDate(nextDeliveryDate)) throw new Error('Next delivery date is not 2 days after today');
      const upcomingOrders = await this.getMyUpcomingEOrders(signedInUser);
      const getNewOrder = (
        rest: { restId: string, meals: ICartMeal[] } | null,
        deliveryDate: number,
        deliveryTime: deliveryTime,
        donationCount: number,
        invoiceDate: number,
        order: EOrder,
      ): Omit<EOrder, 'stripeSubscriptionId' | 'createdDate' | 'consumer'> => ({
        costs: {
          ...order.costs,
          mealPrice,
          total,
        },
        status: 'Open',
        cartUpdatedDate: updatedDate,
        rest: rest || order.rest,
        invoiceDate,
        deliveryDate,
        deliveryTime,
        donationCount,
      })
      return Promise.all(upcomingOrders.map(async ({ _id, order }, orderNum) => {
        if (!this.restService) throw new Error ('RestService not set');
        const deliveryDate = moment(nextDeliveryDate).add(orderNum, 'w').valueOf();
        const invoiceDate = moment(deliveryDate).subtract(2, 'd').valueOf();
        const deliveryTime = plan.deliveryTime;
        const myMealsCount = Cart.getMealCount(order.rest.meals);
        const totalMeals = myMealsCount + order.donationCount;
        let newDonationCount = order.donationCount;
        if (totalMeals === targetMealCount) {
          return this.elastic.update({
            index: ORDER_INDEX,
            id: _id,
            body: {
              doc: getNewOrder(
                null,
                deliveryDate,
                deliveryTime,
                order.donationCount,
                invoiceDate,
                order
              ),
            }
          })
        } else if (totalMeals > targetMealCount) {
          const numToRemove = totalMeals - targetMealCount;
          if (numToRemove > order.donationCount) {
            newDonationCount = 0;
            removeMealsRandomly(order.rest.meals, numToRemove - order.donationCount);
          } else {
            newDonationCount = order.donationCount - numToRemove;
          }
        } else {
          if (order.rest.restId) {
            const rest = await this.restService.getRest(order.rest.restId);
            if (!rest) throw new Error(`Failed to find rest with id '${order.rest.restId}'`);
            const randomMeals = chooseRandomMeals(rest.menu, targetMealCount - totalMeals);
            let randomMeal = randomMeals.shift();
            while (randomMeal) {
              const orderMealIndex = order.rest.meals.findIndex(oMeal => oMeal.mealId === randomMeal!.mealId);
              if (orderMealIndex !== -1) {
                const newCartMeal: ICartMeal = {
                  ...order.rest.meals[orderMealIndex],
                  quantity: order.rest.meals[orderMealIndex].quantity + randomMeal.quantity,
                }
                order.rest.meals[orderMealIndex] = newCartMeal;
              } else {
                order.rest.meals.push(randomMeal);
              }
              randomMeal = randomMeals.shift(); 
            }
          } else {
            // full donation order or skipped order
            const eOrderRest = await this.chooseRandomRestAndMeals(plan.cuisines, targetMealCount - order.donationCount);
            return this.elastic.update({
              index: ORDER_INDEX,
              id: _id,
              body: {
                doc: getNewOrder(
                  eOrderRest,
                  deliveryDate,
                  deliveryTime,
                  order.donationCount,
                  invoiceDate, 
                  order
                ),
              }
            })
          }
        }
        return this.elastic.update({
          index: ORDER_INDEX,
          id: _id,
          body: {
            doc: getNewOrder(
              order.rest.restId === null ? // this happens when downgrading an order with only donations
              null
              :
              {
                restId: order.rest.restId,
                meals: order.rest.meals
              },
              deliveryDate,
              deliveryTime,
              newDonationCount,
              invoiceDate,
              order
            ),
          }
        })
      }))
    } catch (e) {
      console.error(`[OrderService] Failed to update upcoming orders for consumer '${signedInUser && signedInUser._id}'`);
      throw e;
    }
  }

  async updateUpcomingOrdersProfile(signedInUser: SignedInUser, profile: IConsumerProfile): Promise<MutationBoolRes> {
    if (!signedInUser) throw getNotSignedInErr()
    try {
      await this.elastic.updateByQuery({
        index: ORDER_INDEX,
        size: 1000,
        body: {
          query: getUpcomingOrdersQuery(signedInUser._id),
          script: {
            source: 'ctx._source.consumer.profile = params.profile',
            lang: 'painless',
            params: {
              profile
            }
          },
        }
      });
      return {
        res: true,
        error: null
      }
    } catch(e) {
      console.error(`[OrderService]: Couldn't update UpComingOrders for '${signedInUser._id}'`, e.stack);
      throw new Error('Internal Server Error');
    } 
  }
}

let orderService: OrderService;

export const initOrderService = (
  elastic: Client,
  stripe: Stripe,
) => {
  if (orderService && process.env.NODE_ENV !== 'test') throw new Error('[OrderService] already initialized.');
  orderService = new OrderService(
    elastic,
    stripe,
  );
  return orderService;
};

export const getOrderService = () => {
  if (orderService) return orderService;
  initOrderService(
    initElastic(),
    new Stripe(activeConfig.server.stripe.key, {
      apiVersion: '2020-03-02',
    })
  );
  orderService!.setConsumerService(getConsumerService());
  orderService!.setGeoService(getGeoService());
  orderService!.setPlanService(getPlanService());
  orderService!.setRestService(getRestService());
  return orderService;
}
