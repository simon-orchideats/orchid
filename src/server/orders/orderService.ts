import { IAddress } from './../../place/addressModel';
import { EOrder, IOrder, IUpdateOrderInput } from './../../order/orderModel';
import { IMeal } from './../../rest/mealModel';
import { getPlanService, IPlanService } from './../plans/planService';
import { RenewalTypes } from './../../consumer/consumerModel';
import { SignedInUser } from './../utils/models';
import { getConsumerService, IConsumerService } from './../consumer/consumerService';
import { ICartInput, Cart, ICartMeal } from './../../order/cartModel';
import { getGeoService, IGeoService } from './../place/geoService';
import { getRestService, IRestService } from './../rests/restService';
import { getCannotBeEmptyError } from './../utils/error';
import { isDate2DaysLater } from './../../order/utils';
import { initElastic, SearchResponse } from './../elasticConnector';
import { Client, ApiResponse } from '@elastic/elasticsearch';
import { Order } from '../../order/orderModel';
import Stripe from 'stripe';
import { activeConfig } from '../../config';
import { Consumer } from '../../consumer/consumerModel';
import moment from 'moment';
import { MutationBoolRes } from '../../utils/mutationResModel';

const ORDER_INDEX = 'orders';

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
    return `Delivery date '${moment(date).format('M/D/YY')}' is not 2 days in advance`;
  }
}

class OrderService {
  private readonly elastic: Client
  private readonly stripe: Stripe
  private readonly geoService: IGeoService;
  private readonly planService: IPlanService;
  private readonly consumerService: IConsumerService;
  private readonly restService: IRestService;

  public constructor(
    elastic: Client,
    stripe: Stripe,
    geoService: IGeoService,
    planService: IPlanService,
    consumerService: IConsumerService,
    restService: IRestService
  ) {
    this.elastic = elastic;
    this.stripe = stripe;
    this.geoService = geoService;
    this.planService = planService;
    this.consumerService = consumerService;
    this.restService = restService;
  }

  private validateRest(restId: string, meals: ICartMeal[]) {
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
    return this.geoService.getGeocode(address1, city, state, zip)
    .then(() => '')  
    .catch(e => {
      const msg = `Couldn't verify address '${address1} ${city} ${state}, ${zip}'`
      console.warn('[OrderService]', msg, e.stack);
      return msg;
    });
  } 

  private validatePlan(planId: string, cartMealCount: number) {
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

    const p1 = this.validateRest(cart.restId, cart.meals);
    const p2 = this.validateAddress(cart.destination.address);
    const p3 = this.validatePlan(cart.consumerPlan.stripePlanId, Cart.getMealCount(cart.meals));

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

    const {
      renewal,
      cuisines,
    } = cart.consumerPlan;

    if (renewal === RenewalTypes.Auto && cuisines.length === 0) {
      const msg = `Cuisines cannot be empty if renewal type is '${renewal}'`;
      console.warn('[OrderService]', msg);
      return msg;
    }

    return '';
  }

  private async validateUpdateOrder(updateOptions: IUpdateOrderInput, now: number) {
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
    const mealCount = Cart.getMealCount(updateOptions.meals);
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

  async placeOrder(signedInUser: SignedInUser, cart: ICartInput): Promise<MutationBoolRes> {
    try {
      const validation = await this.validateCart(cart);
      if (validation) {
        return {
          res: false,
          error: validation
        }
      }

      const {
        deliveryDay,
        renewal,
        cuisines,
        stripePlanId,
      } = cart.consumerPlan;
    
      if (renewal === RenewalTypes.Auto && cuisines.length === 0) {
        const msg = `Cuisines cannot be empty if renewal type is '${renewal}'`;
        console.warn('[OrderService]', msg);
        return {
          res: false,
          error: msg
        }
      }

      let stripeCustomerId = signedInUser.stripeCustomerId;
      let subscription: Stripe.Subscription;
      const invoiceDateSeconds = Math.round(moment(cart.deliveryDate).subtract(2, 'd').valueOf() / 1000)
      if (signedInUser.stripeSubscriptionId) {
        const msg = `Subscription '${signedInUser.stripeSubscriptionId}' already exists`;
        console.warn('[OrderService]', msg)
        return {
          res: false,
          error: msg
        }
      } else if (stripeCustomerId) {
        const msg = `User '${stripeCustomerId}' already exists`;
        console.warn('[OrderService]', msg)
        return {
          res: false,
          error: msg
        }
      } else {
        const stripeCustomer = await this.stripe.customers.create({
          payment_method: cart.paymentMethodId,
          email: signedInUser.profile.email,
          invoice_settings: {
            default_payment_method: cart.paymentMethodId,
          },
        });
        stripeCustomerId = stripeCustomer.id;
        try {
          subscription = await this.stripe.subscriptions.create({
            proration_behavior: 'none',
            billing_cycle_anchor: invoiceDateSeconds,
            customer: stripeCustomerId,
            // fails on any id that isn't an active stripe plan
            items: [{ plan: stripePlanId }]
          });
        } catch (e) {
          // delete stripe customer to avoid zombie stripe customers
          await this.stripe.customers.del(stripeCustomerId);
          throw e;
        }
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
      const consumerUpserter = this.consumerService.upsertConsumer(signedInUser._id, {
        createdDate: Date.now(),
        stripeCustomerId,
        stripeSubscriptionId: subscription.id,
        plan: {
          stripePlanId,
          deliveryDay,
          renewal,
          cuisines,
        },
        profile: {
          name: signedInUser.profile.name,
          email: signedInUser.profile.email,
          phone: cart.phone,
          card: cart.card,
          destination: cart.destination,
        }
      });

      if (cart.consumerPlan.renewal === RenewalTypes.Auto) {
        this.restService.getRestsByCuisines(cart.consumerPlan.cuisines, ['menu'])
          .then(rests => {
            if (rests.length === 0) throw new Error(`Rests of cuisine '${JSON.stringify(cart.consumerPlan.cuisines)}' is empty`)
            const rest = rests[Math.floor(Math.random() * rests.length)];
            const menu = rest.menu;
            const chooseRandomly = getItemChooser<IMeal>(menu);
            const meals: IMeal[] = [];
            for (let i = 0; i < Cart.getMealCount(cart.meals); i++) meals.push(chooseRandomly())
            const cartMeals = Cart.getCartMeals(meals);
            const nextDeliveryDate = moment(cart.deliveryDate).add(1, 'w').valueOf();
            const newCart = {
              ...cart,
              restId: rest._id,
              meals: cartMeals,
              deliveryDate: nextDeliveryDate
            }
            const order = Order.getNewOrderFromCartInput(
              signedInUser,
              newCart,
              // divide by 1000, then mulitply by 1000 to keep calculation consistent
              Math.round(moment(nextDeliveryDate).subtract(2, 'd').valueOf() / 1000) * 1000,
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
      }

      await Promise.all([consumerUpserter, indexer]);

      return {
        res: true,
        error: null
      };
    } catch (e) {
      console.error('[OrderService] could not place order', e.stack);
      throw new Error('Internal Server Error');
    }
  }

  async getMyUpcomingOrders(signedInUser: SignedInUser): Promise<IOrder[]> {
    try {
      const res: ApiResponse<SearchResponse<EOrder>> = await this.elastic.search({
        index: ORDER_INDEX,
        size: 1000,
        body: {
          query: {
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
                        'consumer._id': signedInUser._id
                      }
                    }
                  ]
                }
              }
            }
          },
          sort: [
            {
              deliveryDate: {
                order: 'asc',
              }
            }
          ],
        }
      });
      return await Promise.all(res.body.hits.hits.map(async ({ _id, _source }) => {
        if (_source.rest.restId) {
          const rest = await this.restService.getRest(_source.rest.restId)
          if (!rest) throw Error(`Couldn't get rest ${_source.rest.restId}`);
          return Order.getIOrderFromEOrder(_id, _source, rest);
        }
        return Order.getIOrderFromEOrder(_id, _source, null)
      }))
    } catch (e) {
      console.error(`[OrderService] couldn't get upcoming orders for consumer '${signedInUser._id}'. '${e.stack}'`);
      throw new Error('Internal Server Error');
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

  async updateOrder(
    signedInUser: SignedInUser,
    orderId: string,
    updateOptions: IUpdateOrderInput,
    now = Date.now(),
  ): Promise<MutationBoolRes> {
    try {
      const validation = await this.validateUpdateOrder(updateOptions, now);
      if (validation) {
        return {
          res: false,
          error: validation
        };
      }
      if (!signedInUser) {
        const msg = `No signed-in user`;
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
  
      const targetOrder = await this.getOrder(orderId);
      if (!targetOrder) throw new Error(`Couldn't get order '${orderId}'`);

      if (targetOrder.consumer._id !== signedInUser._id) {
        const msg = 'Can only update your own orders';
        console.warn(
          '[OrderService]',
          `${msg}. targerOrder consonsumer '${targetOrder.consumer._id}', signedInUser '${signedInUser._id}'`
        )
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

      const targetOrderInvoiceDateDisplay = moment(targetOrderInvoiceDate).format('M/D/YY');
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
      const mealCount = Cart.getMealCount(updateOptions.meals);
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
            description: `Plan Adjustment for payment on ${targetOrderInvoiceDateDisplay}`,
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
}

let orderService: OrderService;

export const initOrderService = (
  elastic: Client,
  stripe: Stripe,
  geoService: IGeoService,
  planService: IPlanService,
  consumerService: IConsumerService,
  restService: IRestService,
) => {
  if (orderService && process.env.NODE_ENV !== 'test') throw new Error('[OrderService] already initialized.');
  orderService = new OrderService(
    elastic,
    stripe,
    geoService,
    planService,
    consumerService,
    restService,
  );
};

export const getOrderService = () => {
  if (orderService) return orderService;
  initOrderService(
    initElastic(),
    new Stripe(activeConfig.server.stripe.key, {
      apiVersion: '2019-12-03',
    }),
    getGeoService(),
    getPlanService(),
    getConsumerService(),
    getRestService(),
  );
  return orderService;
}
