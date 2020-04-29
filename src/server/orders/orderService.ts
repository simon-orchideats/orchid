import { getNextDeliveryDate, isDate2DaysLater } from './../../order/utils';
import { Tier, IPlan, PlanName, PlanNames } from './../../plan/planModel';
import { refetchAccessToken } from '../../utils/auth'
import { IncomingMessage, OutgoingMessage } from 'http';
import { IAddress } from './../../place/addressModel';
import { Order, EOrder, IOrder, IMealPrice } from './../../order/orderModel';
import { IMeal } from './../../rest/mealModel';
import { getPlanService, IPlanService } from './../plans/planService';
import { Consumer, IConsumer, EConsumer, CuisineType, IConsumerProfile } from './../../consumer/consumerModel';
import { SignedInUser, MutationBoolRes, MutationConsumerRes } from '../../utils/apolloUtils';
import { getConsumerService, IConsumerService } from './../consumer/consumerService';
import { ICartInput, Cart } from './../../order/cartModel';
import { getGeoService, IGeoService } from './../place/geoService';
import { getRestService, IRestService } from './../rests/restService';
import { getCannotBeEmptyError, getNotSignedInErr } from './../utils/error';
import { initElastic, SearchResponse } from './../elasticConnector';
import { Client, ApiResponse } from '@elastic/elasticsearch';
import Stripe from 'stripe';
import { activeConfig } from '../../config';
import moment from 'moment-timezone';
import { IDeliveryMeal, IDeliveryInput, DeliveryInput, IDelivery, IUpdateDeliveryInput  } from '../../order/deliveryModel';

const ORDER_INDEX = 'orders';
export const getAdjustmentDesc = (fromPlanCount: number, toPlanCount: number, date: string) =>
  `Plan adjustment from ${fromPlanCount} to ${toPlanCount} for week of ${date}`
export const adjustmentDateFormat = 'M/D/YY';

const chooseRandomMeals = (
  menu: IMeal[],
  mealCount: number,
  restId: string,
  restName: string
): IDeliveryMeal[] => {
  const chooseRandomly = getItemChooser<IMeal>(menu);
  const meals: IMeal[] = [];
  for (let i = 0; i < mealCount; i++) meals.push(chooseRandomly())
  return Cart.getDeliveryMeals(meals, restId, restName);
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

  //@ts-ignore todo simon: do we still need this?
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
              invoiceDate: {
                gte: 'now',
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

//@ts-ignore todo simon: do we still need this?
const removeMealsRandomly = (meals: IDeliveryMeal[], numMealsToRemove: number) => {
  const chooseRandomly = getItemChooser<IDeliveryMeal>(meals);
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
  deleteOrder: (orderId: string) => Promise<void>
  placeOrder(
    signedInUser: SignedInUser,
    cart: ICartInput,
    req?: IncomingMessage,
    res?: OutgoingMessage,
  ): Promise<MutationConsumerRes>
  getMyUpcomingEOrders(signedInUser: SignedInUser): Promise<{ _id: string, order: EOrder }[]>
  getMyUpcomingIOrders(signedInUser: SignedInUser): Promise<IOrder[]>,
  removeDonations( 
    signedInUser: SignedInUser,
    orderId: string
  ): Promise<MutationBoolRes>
  skipDelivery(
    signedInUser: SignedInUser,
    orderId: string,
    deliveryIndex: number,
  ): Promise<MutationBoolRes>
  updateDeliveries(
    signedInUser: SignedInUser,
    orderId: string,
    updateOptions: IUpdateDeliveryInput,
  ): Promise<MutationBoolRes>
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

  //@ts-ignore todo simon: do we still need this?
  private async chooseRandomRestAndMeals(cuisines: CuisineType[], mealCount: number) {
    try {
      if (!this.restService) throw new Error('No rest service');
      const rests = await this.restService.getRestsByCuisines(cuisines, ['menu'])
      if (rests.length === 0) throw new Error(`Rests of cuisine '${JSON.stringify(cuisines)}' is empty`)
      const rest = rests[Math.floor(Math.random() * rests.length)];
      return {
        restId: rest._id,
        meals: chooseRandomMeals(rest.menu, mealCount, rest._id, rest.profile.name),
      };
    } catch (e) {
      console.error(`[OrderService] could not auto pick rests and meals`, e.stack)
      throw e;
    }
  }

  //@ts-ignore // todo simon: do this
  private validateRest(restId: string, meals: IDeliveryMeal[]) {
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

  //@ts-ignore // todo simon: do this
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

  //@ts-ignore // todo simon: do this
  private validatePlan(planId: string, cartMealCount: number) {
    if (!this.planService) return Promise.reject('PlanService not set');
    return '';
    // return this.planService.getPlan(planId)
    //   .then(stripePlan => {
    //     if (!stripePlan) {
    //       const msg = `Can't find plan '${planId}'`
    //       console.warn('[OrderService]', msg);
    //       return msg;
    //     }
    //     if (cartMealCount !== stripePlan.mealCount) {
    //       const msg = `Plan meal count '${stripePlan.mealCount}' does't match cart meal count '${cartMealCount}' for plan '${planId}'`
    //       console.warn('[OrderService]', msg);
    //       return msg;
    //     }
    //     return '';
    //   })
    //   .catch(e => {
    //     const msg = `Couldn't verify plan '${planId}'`
    //     console.warn('[OrderService]', msg, e.stack);
    //     return msg;
    //   })
  }

  private async validateCart(cart: ICartInput) {
    const phoneValidation = validatePhone(cart.phone);
    if (phoneValidation) return phoneValidation;
    // todo simon: revalidate again
    // const deliveryDateValidation = validateDeliveryDate(cart.deliveryDate);
    // if (deliveryDateValidation) return deliveryDateValidation;

    // if (!Consumer.isDeliveryDayValid(cart.consumerPlan.deliveryDay)) {
    //   const msg = `Delivery day '${cart.consumerPlan.deliveryDay}' must be 0, 1, 2, 3, 4, 5, 6`;
    //   console.warn('[OrderService]', msg);
    //   return msg;
    // }

    if (cart.consumerPlan.cuisines.length === 0) {
      const msg = 'Cuisines cannot be empty';
      console.warn('[OrderService]', msg);
      return msg;
    }

    // todo simon: revalidate again
    // let p1;
    // if (cart.restId) p1 = this.validateRest(cart.restId, cart.meals);
    // const p2 = this.validateAddress(cart.destination.address);
    // const p3 = this.validatePlan(cart.consumerPlan.stripePlanId, Cart.getMealCount(cart));

    // const messages = await Promise.all([p1, p2, p3]);
    // if (messages[0]) {
    //   return messages[0]
    // }
    // if (messages[1]) {
    //   return messages[1]
    // }
    // if (messages[2]) {
    //   return messages[2]
    // }

    return '';
  }

  // todo simon: enable
  //@ts-ignore
  //private async validateUpdateOrderInput(updateOptions: IUpdateOrderInput, now: number) {
    // todo simon: revalidate again
    // if (!this.planService) return Promise.reject('PlanService not set');
    // const phoneValidation = validatePhone(updateOptions.phone);
    // if (phoneValidation) return phoneValidation;
    // const deliveryDateValidation = validateDeliveryDate(updateOptions.deliveryDate, now);
    // if (deliveryDateValidation) return deliveryDateValidation;

    // let p1 = Promise.resolve('');
    // if (updateOptions.restId) {
    //   p1 = this.validateRest(updateOptions.restId, updateOptions.meals);
    // }
    // const p2 = this.validateAddress(updateOptions.destination.address);
    // let p3 = Promise.resolve('');
    // const mealCount = Cart.getMealCount(updateOptions.meals) + updateOptions.donationCount;
    // if (mealCount > 0) {
    //   p3 = this.planService.getPlanByCount(mealCount)
    //     .then(plan => {
    //       if (!plan) {
    //         const msg = `Can't find plan with meal count '${mealCount}'`
    //         console.warn('[OrderService]', msg);
    //         return msg;
    //       }
    //       return '';
    //     })
    //     .catch(e => {
    //       const msg = `Failed getPlanByCount with meal count '${mealCount}'`;
    //       console.warn('[OrderService]', msg, e.stack);
    //       return msg;
    //     });
    // }

    // const messages = await Promise.all([p1, p2, p3]);
    // if (messages[0]) {
    //   return messages[0]
    // }
    // if (messages[1]) {
    //   return messages[1]
    // }
    // if (messages[2]) {
    //   return messages[2]
    // }
 // }

  //@ts-ignore todo simon: do we still need this?
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
    //@ts-ignore todo simon: do this
    mealCount: number,
    //@ts-ignore todo simon: do this
    weekPrice: number,
    //@ts-ignore todo simon: do this
    _mealPrice: number
  ) {
    try {
      if (!consumer.plan) throw new Error(`Missing consumer plan for consumer '${consumer._id}'`);
      if (!consumer.stripeSubscriptionId) throw new Error(`Missing subscriptionId for consumer '${consumer._id}'`);
      // const rest = await this.chooseRandomRestAndMeals(consumer.plan.cuisines, mealCount);
      const now = Date.now();
      //@ts-ignore todo simon: make a real eorder
      const eOrder: EOrder = {
        cartUpdatedDate: now,
        consumer: {
          userId: consumer._id,
          profile: consumer.profile,
        },
        costs: {
          tax: 0,
          tip: 0,
          // todo simon: sshould not be mealPrices: []
          mealPrices: [],
          percentFee: 0,
          flatRateFee: 0,
        },
        createdDate: now,
        invoiceDate: iDate,
        // deliveryDate: moment(iDate).add(2, 'd').valueOf(),
        // rest,
        // status: 'Open',
        stripeSubscriptionId: consumer.stripeSubscriptionId,
        // deliveryTime: consumer.plan.deliveryTime,
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

  public async deleteOrder(orderId: string) {
    try {
      await this.elastic.delete({
        index: ORDER_INDEX,
        id: orderId,
      })
    } catch (e) {
      console.error(`Failed to delete orderId '${orderId}'`, e.stack);
      throw e;
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
      if (!this.planService) throw new Error('PlanService not set');

      const validation = await this.validateCart(cart);
      if (validation) {
        return {
          res: null,
          error: validation
        }
      }

      const {
        cuisines,
        schedules,
        mealPlans
      } = cart.consumerPlan;

      let stripeCustomerId = signedInUser.stripeCustomerId;
      let subscription: Stripe.Subscription;
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
          customer: stripeCustomerId,
          items: mealPlans.map(mp => ({ plan: mp.stripePlanId }))
        });
      } catch (e) {
        console.error(`Failed to create stripe subscription for consumer '${signedInUser._id}'`
                      + `with stripe customerId '${stripeCustomerId}'`, e.stack);
        throw e;
      }

      let plans: IPlan[];
      try {
        plans = await this.planService.getAvailablePlans();
      } catch (e) {
        console.error(`Failed to get available plans: '${e.stack}'`);
        throw e;
      }

      const mealPrices: IMealPrice[] = [];
      mealPlans.forEach(mp => {
        const mealPrice = Tier.getMealPrice(
          mp.planName,
          mp.mealCount,
          plans
        );
        mealPrices.push({
          stripePlanId: mp.stripePlanId,
          planName: mp.planName,
          mealPrice,
        })
      });

      const order = Order.getNewOrderFromCartInput(
        signedInUser,
        cart,
        subscription.current_period_end * 1000,
        subscription.id,
        mealPrices,
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
          mealPlans,
          schedules,
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

      this.restService.getRestsByCuisines(cuisines, ['menu', 'profile', 'location']).then(rests => {
        if (rests.length === 0) throw new Error(`Rests of cuisine '${JSON.stringify(cuisines)}' is empty`)
        const deliveries: IDeliveryInput[] = [];
        const totalMeals = DeliveryInput.getMealCount(cart.deliveries) + cart.donationCount;
        const schedule = cart.consumerPlan.schedules;
        const numDeliveries = schedule.length;
        const mealsPerDelivery = Math.floor(totalMeals / numDeliveries);
        let remainingMeals = totalMeals % numDeliveries;
        const chooseRandomRest = getItemChooser(rests);
        for (let i = 0; i < numDeliveries; i++) {
          const rest = chooseRandomRest();
          const meals = chooseRandomMeals(
            rest.menu,
            mealsPerDelivery + remainingMeals,
            rest._id,
            rest.profile.name
          );
          remainingMeals = 0;
          deliveries.push({
            deliveryDate: getNextDeliveryDate(schedule[i].day, rest.location.timezone).add(1, 'w').valueOf(),
            deliveryTime: schedule[i].time,
            discount: null,
            meals,
          })
        }

        const automatedOrder = Order.getNewOrderFromCartInput(
          signedInUser,
          { ...cart, deliveries, donationCount: 0 },
          moment(subscription.current_period_end * 1000).add(1, 'w').valueOf(),
          subscription.id,
          mealPrices,
        );
      
        return this.elastic.index({
          index: ORDER_INDEX,
          body: automatedOrder
        })
      }).catch(e => {
        console.error(`[OrderService] could not auto generate order from placeOrder by cuisines`, e.stack)
      });
      
      this.consumerService.upsertMarketingEmail(
        signedInUser.profile.email,
        signedInUser.profile.name,
        cart.destination.address,
      ).catch(e => {
        console.error(`[OrderService] failed to upsert marketing email '${signedInUser.profile.email}'`, e.stack);
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
              invoiceDate: {
                order: 'asc',
              }
            }
          ],
        }
      });
      // todo simon: sort the delivieries
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
      return res.map(({ _id, order }) => Order.getIOrderFromEOrder(_id, order))
    } catch (e) {
      console.error(`[OrderService] couldn't get upcoming IOrders for consumer '${signedInUser._id}'. '${e.stack}'`);
      throw new Error('Internal Server Error');
    }
  }
  
  async removeDonations(
    signedInUser: SignedInUser,
    orderId: string,
  ): Promise<MutationBoolRes> {
    try {
      const res = await this.validateOrderUpdate(orderId, signedInUser);
      if (res.error) {
        return {
          res: false,
          error: res.error
        }
      }
      if (!res.order) throw new Error('Missing order'); 
      const targetOrder = res.order;
      const mealPrices = this.getMealPriceFromDeliveries(res.plans, targetOrder.deliveries, 0)
      const doc: Omit<EOrder, 'stripeSubscriptionId' | 'createdDate' | 'invoiceDate' | 'consumer'> = {
        costs: {
          ...targetOrder.costs,
          mealPrices
        },
        cartUpdatedDate: Date.now(),
        deliveries: targetOrder.deliveries,
        donationCount: 0
      }
      try {
        await this.elastic.update({
          index: ORDER_INDEX,
          id: orderId,
          body: {
            doc,
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
      console.error(`[OrderService] couldn't Remove Donations for '${orderId}'`, e.stack);
      throw new Error('Internal Server Error');
    }
  }

  async skipDelivery(
    signedInUser: SignedInUser,
    orderId: string,
    deliveryIndex: number,
  ): Promise<MutationBoolRes> {
    try {
      const res = await this.validateOrderUpdate(orderId, signedInUser);
      if (res.error) {
        return {
          res: false,
          error: res.error
        }
      }
      if (!res.order) throw new Error('Missing order'); 
      const targetOrder = res.order;
      targetOrder.deliveries[deliveryIndex] = { ...targetOrder.deliveries[deliveryIndex], meals: [], status: 'Skipped' };
      const totalCount = targetOrder.deliveries.reduce((counts, d) => {
        return d.meals.reduce((counts, m) => counts += m.quantity, counts)
      }, 0);
      if (totalCount === 0  && (targetOrder.donationCount >= 1 && targetOrder.donationCount < 4)) {
        const msg = 'Donations must be at least 4 before skipping this delivery';
        console.warn(
          '[OrderService]',
          `${msg}. targerOrder consumer '${targetOrder.consumer.userId}', signedInUser '${res.signedInUser._id}'`
        )
        return {
          res: false,
          error: msg
        }
      } 
      const mealPrices = this.getMealPriceFromDeliveries(res.plans, targetOrder.deliveries, targetOrder.donationCount);
      const doc: Omit<EOrder, 'stripeSubscriptionId' | 'createdDate' | 'invoiceDate' | 'consumer' | 'donationCount'> = {
        costs: {
          ...targetOrder.costs,
          mealPrices
          },
        cartUpdatedDate: Date.now(),
        deliveries: targetOrder.deliveries
      }
      try {
        await this.elastic.update({
          index: ORDER_INDEX,
          id: orderId,
          body: {
            doc,
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
      console.error(`[OrderService] couldn't Skip Delivery for '${orderId}' with deliveryIndex '${deliveryIndex}'`, e.stack);
      throw new Error('Internal Server Error');
    }
  }

  async updateDeliveries(
    signedInUser: SignedInUser,
    orderId: string,
    updateOptions: IUpdateDeliveryInput,
  ): Promise<MutationBoolRes> {
    try {
      const res = await this.validateOrderUpdate(orderId, signedInUser);
      if (res.error) {
        return {
          res: false,
          error: res.error
        }
      }
      if (!res.order) throw new Error('Missing order'); 
      const targetOrder = res.order;
      const updatedDeliveries: IDeliveryInput[] = [];
      let limit: number | undefined;
      let totalCount = 0;
      for (let i = 0; i < updateOptions.deliveries.length; i++) {
        const delivery = updateOptions.deliveries[i];
        if (delivery.meals.length === 0) continue;
        if (!limit) {
          const rest = await this.restService?.getRest(delivery.meals[0].restId);
          if (!rest) throw new Error(`Failed to find rest ${updatedDeliveries[0].meals[0].restId}`)
          limit = moment(targetOrder.invoiceDate).tz(rest.location.timezone).add(3,'d').startOf('d').valueOf()
        }
        if (delivery.deliveryDate >= limit) {
          throw new Error (`Delivery date ${delivery.deliveryDate} cannot be equal or past ${limit}`);
        }
        if (delivery.deliveryDate < Date.now()) {
          throw new Error (`Delivery date ${delivery.deliveryDate} cannot be in the past`);
        }
        updatedDeliveries.push(delivery);
        delivery.meals.forEach(meal => totalCount += meal.quantity);
      }
      let currentDeliveries = updatedDeliveries.map<IDelivery>(delivery => ({ ...delivery, status: 'Open' }));
      const targetDeliveries = targetOrder.deliveries.filter(delivery =>
        delivery.status === 'Confirmed'
        || delivery.status === 'Returned'
        || delivery.status === 'Complete'
     );
      currentDeliveries = targetDeliveries.concat(currentDeliveries);
      const mealPrices = this.getMealPriceFromDeliveries(res.plans, currentDeliveries, updateOptions.donationCount);
      try {
        const doc: Omit<EOrder, 'stripeSubscriptionId' | 'createdDate' | 'invoiceDate' | 'consumer'> = {
          costs: {
            ...targetOrder.costs,
            mealPrices
          },
          donationCount: updateOptions.donationCount ? updateOptions.donationCount : targetOrder.donationCount,
          deliveries: currentDeliveries,
          cartUpdatedDate: Date.now(),
        }
        await this.elastic.update({
          index: ORDER_INDEX,
          id: orderId,
          body: {
            doc,
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
      console.error(`[OrderService] couldn't update deliveries for '${orderId}' with updateOptions: '${JSON.stringify(updateOptions)}'`, e.stack);
      throw new Error('Internal Server Error');
    }
  }
  private async validateOrderUpdate (orderId: string, signedInUser: SignedInUser) {
    if (!signedInUser) throw getNotSignedInErr()
    if (!this.planService) throw new Error ('PlanService not set');
    const stripeCustomerId = signedInUser.stripeCustomerId;
    const subscriptionId = signedInUser.stripeSubscriptionId
    if (!stripeCustomerId) {
      const msg = 'Missing stripe customer id';
      console.error('[OrderService]', msg)
      throw new Error(`[OrderService]: ${msg}`)
    }
    if (!subscriptionId) {
      const msg = 'Missing subscription id';
      console.error('[OrderService]', msg)
      throw new Error(`[OrderService]: ${msg}`)
    } 
    const targetOrder = await this.getOrder(orderId);
    if (!targetOrder) throw new Error(`Couldn't get order '${orderId}'`);
    if (targetOrder.consumer.userId !== signedInUser._id) {
      const msg = 'Can only update your own orders';
      console.warn(
        '[OrderService]',
        `${msg}. targerOrder consumer '${targetOrder.consumer.userId}', signedInUser '${signedInUser._id}'`
      )
      return {
        order: null,
        plans: null,
        signedInUser: null,
        error: msg
      }
    }
    const plans = await this.planService.getAvailablePlans()
    return {
      order: targetOrder,
      plans,
      signedInUser,
      error: null,
    }
  }
  private getMealPriceFromDeliveries(plans: IPlan[], newDeliveries: IDelivery[], donationCount: number): IMealPrice[] {
    type mealCounts = {
      [key: string]: {
        stripePlanId: string
        planName: PlanName
        quantity: number
      }
    }
    const standardPlan = plans.find(p => p.name === PlanNames.Standard);
    if (!standardPlan) throw new Error(`Missing ${PlanNames.Standard} plan from plans ${JSON.stringify(plans)}`)
    const intialMealCounts: mealCounts = donationCount > 0 ?
      {
        [standardPlan.stripePlanId]: {
          stripePlanId: standardPlan.stripePlanId,
          planName: PlanNames.Standard,
          quantity: donationCount
        }
      }
    :
      {}
 
    const mealCounts = newDeliveries.reduce<mealCounts>((counts, d) => {
      return d.meals.reduce((counts, m) => {
        if (counts[m.stripePlanId]) {
          counts[m.stripePlanId] = {
            stripePlanId: m.stripePlanId,
            planName: m.planName,
            quantity: counts[m.stripePlanId].quantity + m.quantity,
          }
        } else {
          counts[m.stripePlanId] = {
            stripePlanId: m.stripePlanId,
            planName: m.planName,
            quantity: m.quantity,
          }
        }
        return counts;
      }, counts)
    }, intialMealCounts);
    return Object.values(mealCounts).reduce<IMealPrice[]>((sum, c) => [
      ...sum,
      {
        stripePlanId: c.stripePlanId,
        planName: c.planName,
        mealPrice: Tier.getMealPrice(
          c.planName,
          c.quantity,
          plans
        )
      }
    ], []);
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
