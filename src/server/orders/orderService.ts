import { IDiscount, IWeeklyDiscount, WeeklyDiscount } from './../../order/discountModel';
import { referralFriendAmount, referralSelfAmount, ReferralSource, ReferralPromo, referralMonthDuration, oncePromoKey } from './../../order/promoModel';
import { MutationPromoRes, IPromo, EPromo } from '../../order/promoModel';
import { Cost, ICost } from './../../order/costModel';
import { getNextDeliveryDate, isDateMinDaysLater } from './../../order/utils';
import { IPlan, MIN_MEALS } from './../../plan/planModel';
import { refetchAccessToken } from '../../utils/auth'
import { IncomingMessage, OutgoingMessage } from 'http';
import { IAddress, Address } from './../../place/addressModel';
import { EOrder, IOrder, IMealPrice, MealPrice, Order } from './../../order/orderModel';
import { IMeal, EMeal } from './../../rest/mealModel';
import { getPlanService, IPlanService } from './../plans/planService';
import { EConsumer, IConsumerProfile, MealPlan, Consumer, MIN_DAYS_AHEAD, ConsumerPlan, CuisineType } from './../../consumer/consumerModel';
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
import { IDeliveryMeal, IDeliveryInput, IDelivery, IUpdateDeliveryInput } from '../../order/deliveryModel';
import { getItemChooser } from '../../utils/utils';
import { DiscountReasons } from '../../order/discountModel';

const ORDER_INDEX = 'orders';
const PROMO_INDEX = 'promos';

export const getAdjustmentDesc = (fromPlanCount: number, toPlanCount: number, date: string) =>
  `Plan adjustment from ${fromPlanCount} to ${toPlanCount} for week of ${date}`
export const adjustmentDateFormat = 'M/D/YY';

const doesMealContainCuisines = (meal: EMeal, cuisines: CuisineType[]) => {
  for (let i = 0; i < cuisines.length; i++) {
    if (meal.tags.includes(cuisines[i])) return true;
  }
  return false;
}

const chooseRandomMeals = (
  menu: EMeal[],
  mealCount: number,
  restId: string,
  restName: string,
  taxRate: number,
  cuisines: CuisineType[]
): IDeliveryMeal[] => {
  const chooseRandomly = getItemChooser<EMeal>(menu, m => m.canAutoPick && m.isActive && doesMealContainCuisines(m, cuisines));
  const meals: IMeal[] = [];
  for (let i = 0; i < mealCount; i++) meals.push(chooseRandomly());
  return Cart.getDeliveryMeals(meals, restId, restName, taxRate);
}

// place this fn in here instead of in Promo model so that it stays serverside and client cannot see how we
// check for dupe promo redemptions
const getPromoKey = (phone: string, fullAddr: string) => (fullAddr + phone.replace(/\D/g, '')).replace(/\s/g, '')

const validatePhone = (phone: string) => {
  if (!phone) {
    const msg = getCannotBeEmptyError('Phone number');
    console.warn('[OrderService]', msg);
    return msg;
  }
}

  //@ts-ignore todo simon: do we still need this?
const validateDeliveryDate = (date: number, now = Date.now()) => {
  if (!isDateMinDaysLater(date, now)) {
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
          },
        ],
        must_not: {
          exists: {
            field: 'stripeInvoiceId'
          }
        }
      }
    }
  }
});

const getOrdersWithReferredDiscounts = (signedInUserId: string) => ({
  bool: {
    filter: {
      bool: {
        must: {
          term: {
            'costs.discounts.referredUserId': signedInUserId
          }
        },
        must_not: {
          exists: {
            field: 'stripeInvoiceId'
          }
        }
      }
    }
  }
})

const myUnpaidOrdersQuery = (signedInUserId: string) => ({
  query: {
    bool: {
      filter: {
        bool: {
          must: [
            {
              term: {
                'consumer.userId': signedInUserId
              }
            }
          ],
          must_not: {
            exists: {
              field: 'stripeInvoiceId'
            }
          }
        }
      }
    }
  },
  sort: [
    {
      invoiceDate: {
        order: 'asc',
      }
    }
  ],
})

export interface IOrderService {
  applyOncePromo(code: string, subscriptionId: string): Promise<void>
  addAutomaticOrder(
    userId: string,
    addedWeeks: number,
    consumer: EConsumer,
    invoiceDate: number,
    mealPrices: IMealPrice[],
    promos: IPromo[],
    discounts: IDiscount[],
  ): Promise<void>
  deleteCurrentOrderUnconfirmedDeliveries: (userId: string) => Promise<Pick<IOrder, '_id' | 'deliveries'> | null>
  deleteUnpaidOrdersWithUnconfirmedDeliveries(userId: string): Promise<void>
  placeOrder(
    signedInUser: SignedInUser,
    cart: ICartInput,
    req?: IncomingMessage,
    res?: OutgoingMessage,
  ): Promise<MutationConsumerRes>
  getCurrentOrder(userId: string): Promise<{
    _id: string,
    order: EOrder,
  } | null>
  getMyPaidOrders(signedInUser: SignedInUser): Promise<IOrder[]>
  getUpcomingEOrders(userId: string): Promise<{ _id: string, order: EOrder }[]>
  getMyUpcomingIOrders(signedInUser: SignedInUser): Promise<IOrder[]>
  getPromo(promo: string, phone: string, addrStr: string): Promise<MutationPromoRes>
  getIOrder: (signedInUser: SignedInUser, orderId: string, fields?: string[]) => Promise<IOrder | null>
  processTaxesAndFeesAndDiscounts(
    stripeCustomerId: string,
    invoiceId: string,
    costs: ICost,
    numExtraDeliveries: number,
  ): Promise<void>
  setOrderUsage(subscriptionItemId: string, numMeals: number, timestamp: number): Promise<void>
  setOrderStripeInvoiceId(orderId: string, invoiceId: string): Promise<void>
  removeDonations( 
    signedInUser: SignedInUser,
    orderId: string
  ): Promise<MutationBoolRes>
  removeReferredDiscounts(
    SignedInUser: SignedInUser,
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

  public async getCurrentOrder(userId: string): Promise<{
    _id: string,
    order: EOrder,
  } | null> {
    try {
      const res: ApiResponse<SearchResponse<EOrder>> = await this.elastic.search({
        index: ORDER_INDEX,
        size: 1000,
        body: myUnpaidOrdersQuery(userId)
      });

      // this the case after this week's order has no confirmed meals and the consumer cancels the plan
      if (res.body.hits.total.value === 0) {
        return null;
      };
      const order = res.body.hits.hits[0];
      return {
        _id: order._id,
        order: order._source
      }
    } catch (e) {
      console.error(`[OrderService] Failed to get current order for '${userId}'`, e.stack);
      throw e;
    }
  }

  private async addWeeklyDiscountsToUpcomingOrders(
    userId: string,
    weeklyDiscounts: IWeeklyDiscount[],
  ): Promise<IWeeklyDiscount[]> {
    try {
      const res = await this.getUpcomingEOrders(userId);
      const copyWeeklyDiscounts = weeklyDiscounts.map(wd => WeeklyDiscount.getICopy(wd));

      const newOrders: {
        _id: string;
        order: EOrder;
      }[] = res.map(o => {
        const newDiscounts = [
          ...o.order.costs.discounts,
          ...WeeklyDiscount.removeFirstDiscounts(copyWeeklyDiscounts),
        ];
        return {
          _id: o._id,
          order: {
            ...o.order,
            costs: {
              ...o.order.costs,
              discounts: newDiscounts
            }
          }
        }
      });
      
      newOrders.forEach(order => 
        this.elastic.update({
          index: ORDER_INDEX,
          id: order._id,
          body: {
            doc: order.order,
          }
        }).catch(e => {
          console.error(`Failed to update order ${order._id} with new order containing discount`, e.stack);
          throw e;
        }))
      return copyWeeklyDiscounts.filter(wd => wd.discounts.length > 0);
    } catch (e) {
      console.error(`Failed to add weekly discounts to upcoming orders for '${userId}' with weeklyDiscounts ${JSON.stringify(weeklyDiscounts)}`, e.stack)
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

  private async validatePromo(code: string, phone: string, fullAddr: string): Promise<{
    ePromo: EPromo | null,
    iPromo: IPromo | null,
    referralPromo: ReferralPromo | null,
    error: string | null
  }> {
    try {
      let promo;
      try {
        promo = await this.stripe.coupons.retrieve(code);
      } catch (e) {
        if (e.statusCode === 404) {
          return {
            ePromo: null,
            iPromo: null,
            referralPromo: null,
            error: `Promo code "${code}" doesn't exist`
          }
        }
        console.error(`Failed to get stripe coupon with code '${code}`, e.stack);
        throw e;
      }
      if (!promo.valid) {
        return {
          ePromo: null,
          iPromo: null,
          referralPromo: null,
          error: `Promo code "${code}" expired`
        }
      }
      const key = getPromoKey(phone, fullAddr);
      let res: ApiResponse<SearchResponse<EPromo>>;
      try {
        res = await this.elastic.search({
          index: PROMO_INDEX,
          size: 1000,
          body: {
            query: {
              bool: {
                filter: {
                  bool: {
                    must: [
                      {
                        term: {
                          stripeCouponId: code
                        } as Pick<EPromo, 'stripeCouponId'>
                      },
                      {
                        term: {
                          fullAddrWithPhoneKey: key
                        } as Pick<EPromo, 'fullAddrWithPhoneKey'>
                      },
                    ]
                  }
                }
              }
            }
          }
        });
      } catch (e) {
        console.error(`Failed to get promo '${code}' with key '${key}'`, e.stack);
        throw e;
      }
      const iPromo: IPromo = {
        stripeCouponId: promo.id,
        amountOff: promo.amount_off,
        percentOff: promo.percent_off,
        duration: promo.duration,
      }
      let referralPromo: ReferralPromo | null = null;
      const meta = {
        userId: promo.metadata.userId,
        amountOff: (promo.metadata.amountOff === null || promo.metadata.amountOff === undefined) ? null : parseInt(promo.metadata.amountOff),
        percentOff: (promo.metadata.percentOff === null || promo.metadata.percentOff === undefined) ? null : parseInt(promo.metadata.percentOff),
      } as Partial<ReferralSource>
      if (meta.userId) {
        referralPromo = {
          ...iPromo,
          referralSource: meta as ReferralSource
        }
      }
      if (res.body.hits.total.value === 0) {
        return {
          ePromo: null,
          iPromo,
          referralPromo,
          error: null,
        };
      };
  
      if (res.body.hits.total.value > 1) {
        throw new Error(`Found mulitple promos with code ${code} for key '${key}'`);
      }
    
      const ePromo = res.body.hits.hits[0];
      if (Date.now() < ePromo._source.nextAllowedRedemptionDate) {
        return {
          ePromo: null,
          iPromo: null,
          referralPromo: null,
          error: 'Coupon has already been redeemed.'
        }
      } else {
        return {
          ePromo: {
            _id: ePromo._id,
            ...ePromo._source
          },
          iPromo,
          referralPromo,
          error: null,
        } 
      }
    } catch (e) {
      console.error(`Failed to validate promo ${code} for address '${fullAddr}' and phone '${phone}'`, e.stack);
      throw e;
    }
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

    // const rests: {
    //   [key: string]: IRest | null
    // } = {};
    // await Promise.all(cart.deliveries.map(d => {
    //   d.meals.map(async m => {
    //     if (!this.restService) throw new Error ('RestService not set');
    //     if (!rests[m.restId]) {
    //       rests[m.restId] = await this.restService.getRest(m.restId);
    //     }
    //   });
    // }));

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

  private async validateOrderUpdate (orderId: string, signedInUser: SignedInUser) {
    if (!signedInUser) throw getNotSignedInErr()
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
    const targetOrder = await this.getEOrder(orderId);
    if (!targetOrder) throw new Error(`Couldn't get order '${orderId}'`);
    if (targetOrder.consumer.userId !== signedInUser._id) {
      const msg = 'Can only update your own orders';
      console.warn(
        '[OrderService]',
        `${msg}. targerOrder consumer '${targetOrder.consumer.userId}', signedInUser '${signedInUser._id}'`
      )
      return {
        order: null,
        signedInUser: null,
        error: msg
      }
    }
    return {
      order: targetOrder,
      signedInUser,
      error: null,
    }
  }

  private async redeemPromo(promoCode: string, phone: string, addrStr: string): Promise<{
    iPromo: IPromo | null,
    referralPromo: ReferralPromo | null,
    error: string | null
  }> {
    try {
      const promo = await this.validatePromo(promoCode, phone, addrStr);
      if (promo.error) {
        return {
          iPromo: null,
          referralPromo: null,
          error: promo.error,
        }
      }

      const lastRedemptionDate = Date.now();
      const nextAllowedRedemptionDate = moment(lastRedemptionDate).add(6, 'M').valueOf();

      if (promo.ePromo) {
        const doc: Pick<EPromo, 'lastRedemptionDate' | 'nextAllowedRedemptionDate'> = {
          lastRedemptionDate,
          nextAllowedRedemptionDate,
        }
        try {
          await this.elastic.update({
            index: PROMO_INDEX,
            id: promo.ePromo._id,
            body: {
              doc,
            }
          });
        } catch (e) {
          console.error(`Failed to update promo '${promo.ePromo._id}'`, e.stack);
          throw e;
        }
      } else if (promo.iPromo) {
        const key = getPromoKey(phone, addrStr);
        const body: Omit<EPromo, '_id'> = {
          stripeCouponId: promo.iPromo.stripeCouponId,
          fullAddrWithPhoneKey: getPromoKey(phone, addrStr),
          lastRedemptionDate,
          nextAllowedRedemptionDate,
        }
        try {
          await this.elastic.index({
            index: PROMO_INDEX,
            body,
          })
        } catch (e) {
          console.error(`Failed to add promo '${promo.iPromo.stripeCouponId}' with key '${key}'`, e.stack);
          throw e;
        }
      } else {
        throw new Error('Promo validation passed but missing iPromo and ePromo');
      }
      return {
        iPromo: promo.iPromo,
        referralPromo: promo.referralPromo,
        error: null
      }
    } catch (e) {
      console.error(`[OrderService]: Failed to redeem promo '${promoCode}' for phone '${phone}' and addr '${addrStr}'`, e.stack);
      throw e;
    }
  }

  public async applyOncePromo(code: string, subscriptionId: string): Promise<void> {
    this.stripe.subscriptions.update(subscriptionId, {
      coupon: code
    }).catch(e => {
      console.error(`[OrderService] Failed to update subscription '${subscriptionId}' with promo code '${code}'`, e.stack)
    });
  }

  public async addAutomaticOrder(
    consumerId: string,
    addedWeeks: number,
    consumer: EConsumer,
    invoiceDate: number,
    mealPrices: IMealPrice[],
    promos: IPromo[],
    discounts: IDiscount[],
  ) {
    try {
      if (!consumer.plan) throw new Error(`Missing consumer plan for consumer '${consumerId}'`);
      if (!consumer.stripeSubscriptionId) throw new Error(`Missing subscriptionId for consumer '${consumerId}'`);
      if (!this.restService) throw new Error('Missing RestService');
      if (!consumer.profile.destination) throw new Error (`Consumer '${consumerId}' missing destination`);
      const cuisines = consumer.plan.cuisines;
      const plan = consumer.plan;
      const rests = await this.restService.getNearbyERests(
        consumer.profile.destination.address.zip,
        cuisines,
        true,
        ['menu', 'profile', 'location', 'taxRate']
      );
      if (rests.length === 0) throw new Error(`Rests of cuisine '${JSON.stringify(cuisines)}' is empty`)
      const deliveries: IDeliveryInput[] = [];
      const totalMeals = MealPlan.getTotalCount(plan.mealPlans);
      const schedule = plan.schedules;
      const numDeliveries = schedule.length;
      const mealsPerDelivery = Math.floor(totalMeals / numDeliveries);
      const chooseRandomRest = getItemChooser(rests);
      for (let i = 0; i < numDeliveries; i++) {
        const meals: IDeliveryMeal[] = []
        for (let j = 0; j < mealsPerDelivery; j++) {
          const randomRest = chooseRandomRest();
          const eRest = randomRest.rest;
          Cart.addMealsToExistingDeliveryMeals(
            chooseRandomMeals(
              eRest.menu,
              1,
              randomRest._id,
              eRest.profile.name,
              eRest.taxRate,
              cuisines,
            ),
            meals,
          )
        }
        deliveries.push({
          deliveryDate: getNextDeliveryDate(
            schedule[i].day,
            undefined,
            consumer.profile.destination.timezone
          ).add(addedWeeks, 'w').valueOf(),
          deliveryTime: schedule[i].time,
          discount: null,
          meals,
        });
      }

      const numRemainingMeals= totalMeals % numDeliveries;
      const remainingMeals: IDeliveryMeal[] = [];
      for (let i = 0; i < numRemainingMeals; i++) {
        const randomRest = chooseRandomRest();
        Cart.addMealsToExistingDeliveryMeals(
          chooseRandomMeals(
            randomRest.rest.menu,
            1,
            randomRest._id,
            randomRest.rest.profile.name,
            randomRest.rest.taxRate,
            cuisines,
          ),
          remainingMeals,
        )
      }
      
      Cart.addMealsToExistingDeliveryMeals(
        remainingMeals,
        deliveries[0].meals,
      );

      const automatedOrder = Order.getNewOrder(
        consumerId,
        consumer,
        deliveries,
        0,
        invoiceDate,
        mealPrices,
        promos,
        discounts, 
      );
      await this.elastic.index({
        index: ORDER_INDEX,
        body: automatedOrder
      })
    } catch (e) {
      console.error(`[OrderService] failed to addAutomaticOrder for consumer ${consumerId} and invoiceDate ${invoiceDate}`, e.stack);
      throw e;
    }
  }
  
  private async getEOrder(orderId: string, fields?: string[]) {
    const options: any = {
      index: ORDER_INDEX,
      id: orderId,
    };
    if (fields) options._source = fields;
    try {
      const res: ApiResponse<EOrder> = await this.elastic.getSource(options);
      return res.body;
    } catch (e) {
      console.error(`[OrderService] failed to get EOrder '${orderId}'`, e.stack);
      return null;
    }
  }

  public async getPromo(code: string, phone: string, fullAddr: string): Promise<MutationPromoRes> {
    try {
      const res = await this.validatePromo(code, phone, fullAddr);
      return {
        res: res.iPromo,
        error: res.error,
      }
    } catch (e) {
      console.error(`Failed to apply promo ${code} for address '${fullAddr}' and phone '${phone}'`, e.stack);
      throw e;
    }
  }

  // todo simon: add validation. can only get orders that belong to you
  public async getIOrder(signedInUser: SignedInUser, orderId: string, fields?: string[]) {
    if (!signedInUser) throw getNotSignedInErr()
    const options: any = {
      index: ORDER_INDEX,
      id: orderId,
    };
    if (fields) options._source = fields;
    try {
      const res: ApiResponse<EOrder> = await this.elastic.getSource(options);
      return Order.getIOrderFromEOrder(orderId, res.body);
    } catch (e) {
      console.error(`[OrderService] failed to get IOrder '${orderId}'`, e.stack);
      return null;
    }
  }

  public async getMyPaidOrders(signedInUser: SignedInUser): Promise<IOrder[]> {
    try {
      if (!signedInUser) throw getNotSignedInErr()
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
                      term: {
                        'consumer.userId': signedInUser._id
                      }
                    },
                    {
                      exists: {
                        field: 'stripeInvoiceId'
                      }
                    }
                  ],
                }
              }
            }
          },
          sort: [
            {
              invoiceDate: {
                order: 'desc',
              }
            }
          ],
        }
      });
      return res.body.hits.hits.map(({ _id, _source }) => {
        _source.deliveries.sort((d1, d2) => {
          if (d1.deliveryDate > d2.deliveryDate) return 1;
          if (d1.deliveryDate < d2.deliveryDate) return -1;
          return 0;
        });
        return Order.getIOrderFromEOrder(_id, _source)
      });
    } catch (e) {
      console.error(`[OrderService] couldn't get upcoming EOrders for consumer '${signedInUser?._id}'`, e.stack);
      throw e;
    }
  }

  public async processTaxesAndFeesAndDiscounts(
    stripeCustomerId: string,
    invoiceId: string,
    costs: ICost,
    numExtraDeliveries: number,
  ) {
    try {
      const p1 = this.stripe.invoiceItems.create({
        amount: costs.tax,
        invoice: invoiceId,
        currency: 'usd',
        customer: stripeCustomerId,
        description: 'Taxes',
      }).catch(e => {
        console.error(`Failed to create taxes invoice item for stripe customer '${stripeCustomerId}' and invoiceId '${invoiceId}'`, e.stack);
        throw e;
      });
      const p2 = this.stripe.invoiceItems.create({
        amount: costs.deliveryFee,
        invoice: invoiceId,
        currency: 'usd',
        customer: stripeCustomerId,
        description: `${numExtraDeliveries} extra deliveries`,
      }).catch(e => {
        console.error(`Failed to create delivery fee invoice item for stripe customer '${stripeCustomerId}' and invoiceId '${invoiceId}'`, e.stack);
        throw e;
      });
      const p3 = Promise.all(costs.discounts.map(d => {
        if (!d.amountOff) throw new Error(`[OrderService] Missing amount off for adding discount for customer '${stripeCustomerId}' to invoice '${invoiceId}'`);
        return this.stripe.invoiceItems.create({
          amount: -d.amountOff,
          invoice: invoiceId,
          currency: 'usd',
          customer: stripeCustomerId,
          description: d.description,
        }).catch(e => {
          console.error(`Failed to create discount for stripe customer '${stripeCustomerId}' and invoiceId '${invoiceId}'`, e.stack);
          throw e;
        })
      }))
      await Promise.all([p1, p2, p3]);
      return;
    } catch (e) {
      console.error(`[OrderService] failed to process taxes and fees for order with invoiceId'${invoiceId}'`, e.stack);
      throw e;
    }
  }

  public async placeOrder(
    signedInUser: SignedInUser,
    cart: ICartInput,
    req?: IncomingMessage,
    res?: OutgoingMessage,
  ): Promise<MutationConsumerRes> {
    if (!signedInUser) throw getNotSignedInErr();
    try {
      if (!this.consumerService) throw new Error ('ConsumerService not set');
      if (!this.restService) throw new Error ('RestService not set');
      if (!this.planService) throw new Error('PlanService not set');
      if (!this.geoService) throw new Error('GeoService not set');
      const validation = await this.validateCart(cart);
      if (validation) {
        return {
          res: null,
          error: validation
        }
      }

      const addr = cart.destination.address;
      const fullAddrStr = Address.getFullAddrStr(
        addr.address1,
        addr.city,
        addr.state,
        addr.zip,
        addr.address2
      )
      let iPromo: IPromo | null = null;
      let referralPromo: ReferralPromo | null = null;
      if (cart.promo) {
        const promoRes = await this.redeemPromo(
          cart.promo,
          cart.phone,
          fullAddrStr
        );
        if (promoRes.error) {
          return {
            res: null,
            error: promoRes.error,
          }
        }
        iPromo = promoRes.iPromo;
        referralPromo = promoRes.referralPromo;
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
      
      const geo = await this.geoService.getGeocode(
        addr.address1,
        addr.city,
        addr.state,
        addr.zip,
      );
      // - 60 seconds for extra buffer
      const billingStartDateSeconds = Math.floor(moment().tz(geo.timezone).endOf('d').valueOf() / 1000) - 60;
      const newSub: Stripe.SubscriptionCreateParams = {
        proration_behavior: 'none',
        // start the billing cycle at the end of the day so we always guarantee that devlieres are confirmed before
        // invoice creation. for example, if a customer signed up at 12am, they would have a billing cycle of 12 am so
        // it's possible that stripe creates the invoice before all deliveires were confirmed for 12am.
        billing_cycle_anchor: billingStartDateSeconds,
        customer: stripeCustomerId,
        items: mealPlans.map(mp => ({ plan: mp.stripePlanId }))
      }
      if (iPromo) {
        if (iPromo.duration === 'once') {
          newSub.metadata = {
            [oncePromoKey]: iPromo.stripeCouponId
          };
        } else {
          newSub.coupon = iPromo.stripeCouponId;
        }
      }
      try {
        subscription = await this.stripe.subscriptions.create(newSub);
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

      let newReferralPromo;
      try {
        newReferralPromo = await this.stripe.coupons.create({
          name: signedInUser.profile.name + ' Referral',
          amount_off: referralFriendAmount,
          duration: 'repeating',
          duration_in_months: referralMonthDuration,
          currency: 'usd',
          metadata: {
            userId: signedInUser._id,
            amountOff: referralSelfAmount,
            percentOff: null,
          } as ReferralSource
        });
      } catch (e) {
        console.error(`[OrderService] failed to create referral coupon for '${signedInUser._id}'`, e.stack);
        throw e;
      }
  
      const mealPrices = MealPrice.getMealPrices(mealPlans, plans);
      const consumer: EConsumer = {
        createdDate: Date.now(),
        stripeCustomerId,
        stripeSubscriptionId: subscription.id,
        plan: ConsumerPlan.getEConsumerPlanFromIConsumerPlanInput(
          {
            mealPlans,
            schedules,
            cuisines,
          },
          newReferralPromo.id,
          [],
          subscription.items.data.reduce<{ [key: string]: string }>((sum, subItem) => {
            sum[subItem.plan.id] = subItem.id;
            return sum;
          }, {}),
        ),
        profile: {
          name: signedInUser.profile.name,
          email: signedInUser.profile.email,
          phone: cart.phone,
          card: cart.card,
          destination: {
            ...cart.destination,
            geo: {
              lat: geo.lat,
              lon: geo.lon,
            },
            timezone: geo.timezone
          },
        }
      };
      const newOrderPromos = iPromo ? [ iPromo ] : [];
      const order = Order.getNewOrder(
        signedInUser._id,
        consumer,
        cart.deliveries,
        cart.donationCount,
        moment(billingStartDateSeconds * 1000).add(1, 'w').valueOf(),
        mealPrices,
        newOrderPromos,
        [],
        // make updated date 5 seconds past created date to indicate
        // non auto generated order. this is a hack
        moment().valueOf(),
        moment().add(5, 's').valueOf(),
      );
      const indexer = this.elastic.index({
        index: ORDER_INDEX,
        body: order
      })
      this.addAutomaticOrder(
        signedInUser._id,
        1,
        consumer,
        moment(billingStartDateSeconds * 1000).add(2, 'w').valueOf(),
        mealPrices,
        (iPromo && iPromo.duration !== 'once') ? newOrderPromos : [],
        [],
      ).catch(e => {
        console.error(`[OrderService] could not auto generate order from placeOrder by cuisines`, e.stack)
      });
      this.consumerService.upsertMarketingEmail(
        signedInUser.profile.email,
        signedInUser.profile.name,
        addr,
      ).catch(e => {
        console.error(`[OrderService] failed to upsert marketing email '${signedInUser.profile.email}'`, e.stack);
      });
      const consumerUpserter = this.consumerService.upsertConsumer(signedInUser._id, consumer);
      const consumerAuth0Updater = this.consumerService.updateAuth0MetaData(signedInUser._id, subscription.id, stripeCustomerId);
      await Promise.all([consumerUpserter, indexer, consumerAuth0Updater]);

      if (referralPromo) {
        const source = referralPromo.referralSource;
        const discount: IDiscount = {
          description: `Thanks for inviting ${signedInUser.profile.name.split(' ')[0]}`,
          amountOff: source.amountOff,
          percentOff: source.percentOff,
          reason: DiscountReasons.ReferredAFriend,
          referredUserId: signedInUser._id,
        };
        if (source.amountOff) {
          const weeklyDiscounts: IWeeklyDiscount[] = [
            {
              discounts: [
                discount,
                discount,
                discount,
                discount,
              ]
            }
          ];
          this.addWeeklyDiscountsToUpcomingOrders(source.userId, weeklyDiscounts)
            .then(remainingWeeklyOrders => {
              if (!this.consumerService) {
                const err = new Error ('ConsumerService not set');
                console.error(err.stack);
                throw err;
              };
              return this.consumerService.attachDiscountsToPlan(
                source.userId,
                remainingWeeklyOrders,
                false,
              );
            })
            .catch(e => {
              console.error(`Failed to add discounts to upcoming orders and consumer plan for '${source.userId}'`, e.stack);
            });
        } else {
          console.error(`[OrderService] referralPromo '${referralPromo.stripeCouponId}' missing amount off`);
        }
      }
      // refresh access token so client can pick up new fields in token
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

  async getUpcomingEOrders(userId: string): Promise<{ _id: string, order: EOrder }[]> {
    try {
      const res: ApiResponse<SearchResponse<EOrder>> = await this.elastic.search({
        index: ORDER_INDEX,
        size: 1000,
        body: {
          query: getUpcomingOrdersQuery(userId),
          sort: [
            {
              invoiceDate: {
                order: 'asc',
              }
            }
          ],
        }
      });
      return res.body.hits.hits.map(({ _id, _source }) => {
        _source.deliveries.sort((d1, d2) => {
          if (d1.deliveryDate > d2.deliveryDate) return 1;
          if (d1.deliveryDate < d2.deliveryDate) return -1;
          return 0;
        })
        return {
          _id,
          order: _source,
        }
      });
    } catch (e) {
      console.error(`[OrderService] couldn't get upcoming EOrders for consumer '${userId}'. '${e.stack}'`);
      throw new Error('Internal Server Error');
    }
  }

  async getMyUpcomingIOrders(signedInUser: SignedInUser): Promise<IOrder[]> {
    if (!signedInUser) throw getNotSignedInErr()
    try {
      const res = await this.getUpcomingEOrders(signedInUser._id);
      return res.map(({ _id, order }) => Order.getIOrderFromEOrder(_id, order))
    } catch (e) {
      console.error(`[OrderService] couldn't get upcoming IOrders for consumer '${signedInUser._id}'. '${e.stack}'`);
      throw new Error('Internal Server Error');
    }
  }

  async removeDiscounts(order: { _id: string, order: EOrder }) {
    const doc: Omit<
      EOrder, 
      'stripeSubscriptionId'
      | 'createdDate'
      | 'invoiceDate'
      | 'consumer'
      | 'deliveries'
      | 'plans'
      | 'cartUpdatedDate'
      | 'donationCount'
    > = {
      costs: {
        ...order.order.costs,
        discounts: [],
      },
    }
    this.elastic.update({
      index: ORDER_INDEX,
      id: order._id,
      body: {
        doc,
      }
    }).catch(e => {
      console.error(`[OrderService] Failed to remove discounts for order '${order._id}'`, e.stack);
      throw e;
    })
  }
  
  async removeDonations(
    signedInUser: SignedInUser,
    orderId: string,
  ): Promise<MutationBoolRes> {
    try {
      if (!this.planService) throw new Error ('PlanService not set');
      const res = await this.validateOrderUpdate(orderId, signedInUser);
      if (res.error) {
        return {
          res: false,
          error: res.error
        }
      }
      if (!res.order) throw new Error('Missing order'); 
      const targetOrder = res.order;
      const plans = await this.planService.getAvailablePlans()
      const mealPrices = MealPrice.getMealPriceFromDeliveries(plans, targetOrder.deliveries, 0)
      const doc: Omit<
        EOrder, 
        'stripeSubscriptionId'
        | 'createdDate'
        | 'invoiceDate'
        | 'consumer'
        | 'deliveries'
        | 'plans'
      > = {
        costs: {
          ...targetOrder.costs,
          mealPrices
        },
        cartUpdatedDate: Date.now(),
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

  async deleteCurrentOrderUnconfirmedDeliveries(userId: string): Promise<Pick<IOrder, 'deliveries' | '_id'> | null>  {
    try {
      if (!this.planService) throw new Error ('PlanService not set');
      const order = await this.getCurrentOrder(userId);
      if (!order) throw new Error(`Missing current order for user '${userId}'`)
      const plans = await this.planService.getAvailablePlans();
      const newDeliveries = order.order.deliveries.filter(d => d.status === 'Confirmed');
      const mealPrices = MealPrice.getMealPriceFromDeliveries(plans, newDeliveries, order.order.donationCount);
      const costs: ICost = {
        ...order.order.costs,
        mealPrices,
        tax: Cost.getTaxes(newDeliveries, mealPrices),
        deliveryFee: Cost.getDeliveryFee(newDeliveries),
      }
      const newOrder: Pick<EOrder, 'deliveries' | 'costs'> = {
        deliveries: newDeliveries,
        costs,
      }
      if (newOrder.deliveries.length > 0) {
        try {
          await this.elastic.update({
            index: ORDER_INDEX,
            id: order._id,
            // wait_for because this is deleteByQuery is called immediately after and we need to wait for
            // this update to refresh otherwise, we get conflicts in the deleteByQuery
            refresh: 'wait_for',
            body: {
              doc: newOrder,
            }
          });
          return {
            _id: order._id,
            deliveries: newOrder.deliveries,
          }
        } catch (e) {
          console.error(`Failed to update '${order._id}' with new order '${JSON.stringify(newOrder)}'`, e.stack);
          throw e;
        }
      } else {
        try {
          await this.elastic.delete({
            index: ORDER_INDEX,
            id: order._id,
            // wait_for because this is deleteByQuery is called immediately after and we need to wait for
            // this update to refresh otherwise, we get conflicts in the deleteByQuery
            refresh: 'wait_for',
          });
          return null;
        } catch (e) {
          console.error(`Failed to delete '${order._id}'`, e.stack);
          throw e;
        }
      }
    } catch (e) {
      console.error(`[OrderService] failed to deleteCurrentOrderUnconfirmedDeliveries for userId '${userId}'`, e.stack);
      throw e;
    }
  }

  async deleteUnpaidOrdersWithUnconfirmedDeliveries(userId: string): Promise<void>  {
    try {
      await this.elastic.deleteByQuery({
        index: ORDER_INDEX,
        body: {
          query: {
            bool: {
              filter: {
                bool: {
                  must: [
                    {
                      term: {
                        'consumer.userId': userId
                      }
                    },
                    {
                      bool: {
                        should: [
                          {
                            term: { 'deliveries.status': 'Open' }
                          },
                          {
                            term: { 'deliveries.status': 'Skipped' }
                          }
                        ]
                      }
                    }
                  ],
                  must_not: {
                    exists: {
                      field: 'stripeInvoiceId'
                    }
                  }
                }
              }
            }
          },
        }
      })
    } catch (e) {
      console.error(`[OrderService] Failed to delete orders with unconfirmed deliveries for '${userId}'`, e.stack);
      throw e;
    }
  }
  
  async removeReferredDiscounts(signedInUser: SignedInUser): Promise<MutationBoolRes> {
    try {
      if (!signedInUser) throw getNotSignedInErr();
      await this.elastic.updateByQuery({
        index: ORDER_INDEX,
        body: {
          query: getOrdersWithReferredDiscounts(signedInUser._id),
          script: {
            source: `
              for (int i = 0; i < ctx._source.costs.discounts.length; i++) {
                def discount = ctx._source.costs.discounts[i];
                if (discount.referredUserId.equals(params.referredUserId)) {
                  discount.amountOff = 0;
                  discount.description = params.referredUserName + " canceled/skipped";
                  discount.reason = params.reason;
                }
              }
            `,
            lang: 'painless',
            params: {
              referredUserId: signedInUser._id,
              referredUserName: signedInUser.profile.name.split(' ')[0],
              reason: DiscountReasons.ReferralCanceled,
            }
          },
        }
      });
      return {
        res: true,
        error: null
      }
    } catch (e) {
      console.error(`[OrderService] couldn't removeReferredDiscounts with referredUserId ${signedInUser?._id}'`, e.stack);
      throw e;
    }
  }

  async setOrderUsage(subscriptionItemId: string, numMeals: number, timestamp: number) {
    try {
      await this.stripe.subscriptionItems.createUsageRecord(
        subscriptionItemId,
        {
          quantity: numMeals,
          timestamp,
          action: 'set',
        }
      );
    } catch (e) {
      console.error(`[OrderService] failed to set usage of number '${numMeals}' for subscriptionItemId '${subscriptionItemId}' and timestamp '${timestamp}'`);
      throw e;
    }
  }

  async setOrderStripeInvoiceId(orderId: string, invoiceId: string): Promise<void> {
    try {
      const newOrder: Pick<EOrder, 'stripeInvoiceId'> = {
        stripeInvoiceId: invoiceId,
      }
      await this.elastic.update({
        index: ORDER_INDEX,
        id: orderId,
        body: {
          doc: newOrder,
        }
      });
    } catch (e) {
      console.error(`[OrderService] failed to setOrderStripeInvoiceId for orderId '${orderId}' and invoiceId '${invoiceId}'`, e.stack);
      throw e;
    }
  }

  async skipDelivery(
    signedInUser: SignedInUser,
    orderId: string,
    deliveryIndex: number,
  ): Promise<MutationBoolRes> {
    try {
      if (!signedInUser) throw 'No signed in user';
      if (!this.consumerService) throw new Error ('ConsumerService not set');
      if (!this.planService) throw new Error ('PlanService not set');
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
      const totalCount = targetOrder.deliveries.reduce((counts, d) =>
        d.meals.reduce((counts, m) => counts += m.quantity, counts)
      , 0);

      if (totalCount === 0) {
        this.removeReferredDiscounts(signedInUser).catch(e => {
          console.error(`[OrderService] failed to removeReferredDiscounts for orders for ${signedInUser._id} on delivery skip`, e.stack)
        });
        this.consumerService.removeReferredWeeklyDiscount(signedInUser._id).catch(e => {
          console.error(`[OrderService] failed to removeReferredWeeklyDiscount for plans for  ${signedInUser._id} on delivery skip`, e.stack)
        });
      }

      if (totalCount === 0  && (targetOrder.donationCount >= 1 && targetOrder.donationCount < MIN_MEALS)) {
        const msg = `Donations must be at least ${MIN_MEALS} before skipping this delivery`;
        console.warn(
          '[OrderService]',
          `${msg}. targerOrder consumer '${targetOrder.consumer.userId}', signedInUser '${res.signedInUser._id}'`
        )
        return {
          res: false,
          error: msg
        }
      }
      const plans = await this.planService.getAvailablePlans()
      const mealPrices = MealPrice.getMealPriceFromDeliveries(plans, targetOrder.deliveries, targetOrder.donationCount);
      const doc: Omit<
        EOrder,
        'stripeSubscriptionId'
        | 'createdDate'
        | 'invoiceDate'
        | 'consumer'
        | 'donationCount'
        | 'plans'
      > = {
        costs: {
          ...targetOrder.costs,
          tax: Cost.getTaxes(targetOrder.deliveries, mealPrices),
          deliveryFee: Cost.getDeliveryFee(targetOrder.deliveries),
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
      if (!this.planService) throw new Error ('PlanService not set');
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
      // todo: use consumer timezone instead of rest timezone
      let limit: number | undefined;
      let totalCount = 0;
      for (let i = 0; i < updateOptions.deliveries.length; i++) {
        const delivery = updateOptions.deliveries[i];
        if (delivery.meals.length === 0) continue;
        if (!limit) {
          const rest = await this.restService?.getRest(delivery.meals[0].restId);
          if (!rest) throw new Error(`Failed to find rest ${updatedDeliveries[0].meals[0].restId}`)
          limit = moment(targetOrder.invoiceDate).tz(rest.location.timezone).add(MIN_DAYS_AHEAD + 1, 'd').startOf('d').valueOf()
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
      const targetDeliveries = targetOrder.deliveries.filter(delivery =>
        delivery.status === 'Confirmed'
        || delivery.status === 'Returned'
        || delivery.status === 'Complete'
      );
      const currentDeliveries = targetDeliveries.concat(updatedDeliveries.map<IDelivery>(delivery => ({
        ...delivery,
        status: 'Open',
        meals: delivery.meals.map(m => {
          const sub = targetOrder.plans.find(p => p.stripePlanId === m.stripePlanId);
          if (!sub) {
            const err = new Error(`Missing order meal plan for stripePlanId ${m.stripePlanId}`);
            console.error(err.stack);
            throw err;
          }
          return {
            ...m,
            stripeSubscriptionItemId: sub.stripeSubscriptionItemId
          }
        })
      })));
      const plans = await this.planService.getAvailablePlans()
      const mealPrices = MealPrice.getMealPriceFromDeliveries(plans, currentDeliveries, updateOptions.donationCount);
      try {
        const doc: Omit<
          EOrder,
          'stripeSubscriptionId'
          | 'createdDate'
          | 'invoiceDate'
          | 'consumer'
          | 'plans'
        > = {
          costs: {
            ...targetOrder.costs,
            tax: Cost.getTaxes(currentDeliveries, mealPrices),
            deliveryFee: Cost.getDeliveryFee(currentDeliveries),
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

  async updateUpcomingOrdersProfile(signedInUser: SignedInUser, profile: IConsumerProfile): Promise<MutationBoolRes> {
    if (!signedInUser) throw getNotSignedInErr()
    try {
      await this.elastic.updateByQuery({
        index: ORDER_INDEX,
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
