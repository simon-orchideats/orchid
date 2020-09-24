import { IncomingMessage, OutgoingMessage } from 'http';
import { IAddress } from './../../place/addressModel';
import { EOrder, IOrder, Order } from './../../order/orderModel';
import { getPlanService, IPlanService } from './../plans/planService';
import { Permissions } from './../../consumer/consumerModel';
import { SignedInUser, MutationConsumerRes } from '../../utils/apolloUtils';
import { getConsumerService, IConsumerService } from './../consumer/consumerService';
import { ICartInput } from './../../order/cartModel';
import { getGeoService, IGeoService } from './../place/geoService';
import { getRestService, IRestService } from './../rests/restService';
import { getCannotBeEmptyError, getNotSignedInErr } from './../utils/error';
import { initElastic, SearchResponse } from './../elasticConnector';
import { Client, ApiResponse } from '@elastic/elasticsearch';
import Stripe from 'stripe';
import { activeConfig } from '../../config';
import moment from 'moment-timezone';

const ORDER_INDEX = 'orders';
// const PROMO_INDEX = 'promos';

// // place this fn in here instead of in Promo model so that it stays serverside and client cannot see how we
// // check for dupe promo redemptions
// const getPromoKey = (phone: string, fullAddr: string) => (fullAddr + phone.replace(/\D/g, '')).replace(/\s/g, '')

const validatePhone = (phone: string) => {
  if (!phone) {
    const msg = getCannotBeEmptyError('Phone number');
    console.warn('[OrderService]', msg);
    return msg;
  }
}

// const getMyAllOrdersQuery = (signedInUserId: string) => ({
//   query: {
//     bool: {
//       filter: {
//         bool: {
//           must: [
//             {
//               term: {
//                 "consumer.userId": signedInUserId
//               }
//             }
//           ]
//         }
//       }
//     }
//   }
// })

const getUpcomingOrdersQuery = (signedInUserId?: string) => {
  const query: any = {
    bool: {
      filter: {
        bool: {
          must: [
            {
              range: {
                receptionDate: {
                  gte: 'now',
                }
              },
            },
          ],
          // must_not: {
          //   exists: {
          //     field: 'stripeInvoiceId'
          //   }
          // }
        }
      }
    }
  }
  if (signedInUserId) {
    query.bool.filter.bool.must.push({
      term: {
        'consumer.userId': signedInUserId
      }
    });
  }
  return query;
}

// const myUnpaidOrdersQuery = (signedInUserId: string) => ({
//   query: {
//     bool: {
//       filter: {
//         bool: {
//           must: [
//             {
//               term: {
//                 'consumer.userId': signedInUserId
//               }
//             }
//           ],
//           must_not: {
//             exists: {
//               field: 'stripeInvoiceId'
//             }
//           }
//         }
//       }
//     }
//   },
//   sort: [
//     {
//       invoiceDate: {
//         order: 'asc',
//       }
//     }
//   ],
// })

export interface IOrderService {
  placeOrder(
    signedInUser: SignedInUser,
    cart: ICartInput,
    req?: IncomingMessage,
    res?: OutgoingMessage,
  ): Promise<MutationConsumerRes>
  getAllPaidIOrders(signedInUser: SignedInUser): Promise<IOrder[]>
  getUpcomingEOrders(userId: string): Promise<{ _id: string, order: EOrder }[]>
  getAllUpcomingIOrders(signedInUser: SignedInUser): Promise<IOrder[]>
  getMyPaidOrders(signedInUser: SignedInUser): Promise<IOrder[]>
  getMyUpcomingIOrders(signedInUser: SignedInUser): Promise<IOrder[]>
  getIOrder: (signedInUser: SignedInUser, orderId: string, fields?: string[]) => Promise<IOrder | null>
  // updateUpcomingOrdersProfile(signedInUser: SignedInUser, profile: IConsumerProfile): Promise<MutationBoolRes>,

  // processTaxesAndFeesAndDiscounts(
  //   stripeCustomerId: string,
  //   invoiceId: string,
  //   costs: ICost,
  //   numExtraDeliveries: number,
  // ): Promise<void>
  // setOrderStripePaymentId(orderId: string, invoiceId: string): Promise<void>
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

  //@ts-ignore // todo simon: do this
  private validateRest(restId: string, meals: IOrderMeal[]) {
    if (!this.restService) return Promise.reject('RestService not set');
    return this.restService.getRest(restId, ['menu'])
      .then(rest => {
        if (!rest) {
          const msg = `Can't find rest '${restId}'`
          console.warn('[OrderService]', msg);
          return msg;
        }
        for (let i = 0; i < meals.length; i++) {
          if (!rest.featured.find(meal => meal._id === meals[i].mealId)) {
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

  // private async validatePromo(code: string, phone: string, fullAddr: string): Promise<{
  //   ePromo: EPromo | null,
  //   iPromo: IPromo | null,
  //   referralPromo: ReferralPromo | null,
  //   error: string | null
  // }> {
  //   try {
  //     let promo;
  //     try {
  //       promo = await this.stripe.coupons.retrieve(code);
  //     } catch (e) {
  //       if (e.statusCode === 404) {
  //         return {
  //           ePromo: null,
  //           iPromo: null,
  //           referralPromo: null,
  //           error: `Promo code "${code}" doesn't exist`
  //         }
  //       }
  //       console.error(`Failed to get stripe coupon with code '${code}`, e.stack);
  //       throw e;
  //     }
  //     if (!promo.valid) {
  //       return {
  //         ePromo: null,
  //         iPromo: null,
  //         referralPromo: null,
  //         error: `Promo code "${code}" expired`
  //       }
  //     }
  //     const key = getPromoKey(phone, fullAddr);
  //     let res: ApiResponse<SearchResponse<EPromo>>;
  //     try {
  //       res = await this.elastic.search({
  //         index: PROMO_INDEX,
  //         size: 1000,
  //         body: {
  //           query: {
  //             bool: {
  //               filter: {
  //                 bool: {
  //                   must: [
  //                     {
  //                       term: {
  //                         stripeCouponId: code
  //                       } as Pick<EPromo, 'stripeCouponId'>
  //                     },
  //                     {
  //                       term: {
  //                         fullAddrWithPhoneKey: key
  //                       } as Pick<EPromo, 'fullAddrWithPhoneKey'>
  //                     },
  //                   ]
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       });
  //     } catch (e) {
  //       console.error(`Failed to get promo '${code}' with key '${key}'`, e.stack);
  //       throw e;
  //     }
  //     const iPromo: IPromo = {
  //       stripeCouponId: promo.id,
  //       amountOff: promo.amount_off,
  //       percentOff: promo.percent_off,
  //       duration: promo.duration,
  //     }
  //     let referralPromo: ReferralPromo | null = null;
  //     const meta = {
  //       userId: promo.metadata.userId,
  //       amountOff: (promo.metadata.amountOff === null || promo.metadata.amountOff === undefined) ? null : parseInt(promo.metadata.amountOff),
  //       percentOff: (promo.metadata.percentOff === null || promo.metadata.percentOff === undefined) ? null : parseInt(promo.metadata.percentOff),
  //     } as Partial<ReferralSource>
  //     if (meta.userId) {
  //       referralPromo = {
  //         ...iPromo,
  //         referralSource: meta as ReferralSource
  //       }
  //     }
  //     if (res.body.hits.total.value === 0) {
  //       return {
  //         ePromo: null,
  //         iPromo,
  //         referralPromo,
  //         error: null,
  //       };
  //     };
  
  //     if (res.body.hits.total.value > 1) {
  //       throw new Error(`Found mulitple promos with code ${code} for key '${key}'`);
  //     }
    
  //     const ePromo = res.body.hits.hits[0];
  //     if (Date.now() < ePromo._source.nextAllowedRedemptionDate) {
  //       return {
  //         ePromo: null,
  //         iPromo: null,
  //         referralPromo: null,
  //         error: 'Coupon has already been redeemed.'
  //       }
  //     } else {
  //       return {
  //         ePromo: {
  //           ...ePromo._source,
  //           _id: ePromo._id,
  //         },
  //         iPromo,
  //         referralPromo,
  //         error: null,
  //       } 
  //     }
  //   } catch (e) {
  //     console.error(`Failed to validate promo ${code} for address '${fullAddr}' and phone '${phone}'`, e.stack);
  //     throw e;
  //   }
  // }

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

    // if (cart.consumerPlan.tags.length === 0) {
    //   const msg = 'Cuisines cannot be empty';
    //   console.warn('[OrderService]', msg);
    //   return msg;
    // }

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

  // private async redeemPromo(promoCode: string, phone: string, addrStr: string): Promise<{
  //   iPromo: IPromo | null,
  //   referralPromo: ReferralPromo | null,
  //   error: string | null
  // }> {
  //   try {
  //     const promo = await this.validatePromo(promoCode, phone, addrStr);
  //     if (promo.error) {
  //       return {
  //         iPromo: null,
  //         referralPromo: null,
  //         error: promo.error,
  //       }
  //     }

  //     const lastRedemptionDate = Date.now();
  //     const nextAllowedRedemptionDate = moment(lastRedemptionDate).add(6, 'M').valueOf();

  //     if (promo.ePromo) {
  //       const doc: Pick<EPromo, 'lastRedemptionDate' | 'nextAllowedRedemptionDate'> = {
  //         lastRedemptionDate,
  //         nextAllowedRedemptionDate,
  //       }
  //       try {
  //         await this.elastic.update({
  //           index: PROMO_INDEX,
  //           id: promo.ePromo._id,
  //           body: {
  //             doc,
  //           }
  //         });
  //       } catch (e) {
  //         console.error(`Failed to update promo '${promo.ePromo._id}'`, e.stack);
  //         throw e;
  //       }
  //     } else if (promo.iPromo) {
  //       const key = getPromoKey(phone, addrStr);
  //       const body: Omit<EPromo, '_id'> = {
  //         stripeCouponId: promo.iPromo.stripeCouponId,
  //         fullAddrWithPhoneKey: getPromoKey(phone, addrStr),
  //         lastRedemptionDate,
  //         nextAllowedRedemptionDate,
  //       }
  //       try {
  //         await this.elastic.index({
  //           index: PROMO_INDEX,
  //           body,
  //         })
  //       } catch (e) {
  //         console.error(`Failed to add promo '${promo.iPromo.stripeCouponId}' with key '${key}'`, e.stack);
  //         throw e;
  //       }
  //     } else {
  //       throw new Error('Promo validation passed but missing iPromo and ePromo');
  //     }
  //     return {
  //       iPromo: promo.iPromo,
  //       referralPromo: promo.referralPromo,
  //       error: null
  //     }
  //   } catch (e) {
  //     console.error(`[OrderService]: Failed to redeem promo '${promoCode}' for phone '${phone}' and addr '${addrStr}'`, e.stack);
  //     throw e;
  //   }
  // }

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
                        field: 'stripePaymentId'
                      }
                    }
                  ],
                }
              }
            }
          },
          sort: [
            {
              receptionDate: {
                order: 'desc',
              }
            }
          ],
        }
      });
      return res.body.hits.hits.map(({ _id, _source }) => Order.getIOrderFromEOrder(_id, _source));
    } catch (e) {
      console.error(`[OrderService] couldn't get upcoming EOrders for consumer '${signedInUser?._id}'`, e.stack);
      throw e;
    }
  }

  // public async processTaxesAndFeesAndDiscounts(
  //   stripeCustomerId: string,
  //   invoiceId: string,
  //   costs: ICost,
  //   numExtraDeliveries: number,
  // ) {
    // try {
    //   const p1 = this.stripe.invoiceItems.create({
    //     amount: costs.tax,
    //     invoice: invoiceId,
    //     currency: 'usd',
    //     customer: stripeCustomerId,
    //     description: 'Taxes',
    //   }).catch(e => {
    //     console.error(`Failed to create taxes invoice item for stripe customer '${stripeCustomerId}' and invoiceId '${invoiceId}'`, e.stack);
    //     throw e;
    //   });
    //   const p2 = this.stripe.invoiceItems.create({
    //     amount: costs.deliveryFee,
    //     invoice: invoiceId,
    //     currency: 'usd',
    //     customer: stripeCustomerId,
    //     description: `${numExtraDeliveries} extra deliveries`,
    //   }).catch(e => {
    //     console.error(`Failed to create delivery fee invoice item for stripe customer '${stripeCustomerId}' and invoiceId '${invoiceId}'`, e.stack);
    //     throw e;
    //   });
    //   const p3 = Promise.all(costs.discounts.map(d => {
    //     if (!d.amountOff) throw new Error(`[OrderService] Missing amount off for adding discount for customer '${stripeCustomerId}' to invoice '${invoiceId}'`);
    //     return this.stripe.invoiceItems.create({
    //       amount: -d.amountOff,
    //       invoice: invoiceId,
    //       currency: 'usd',
    //       customer: stripeCustomerId,
    //       description: d.description,
    //     }).catch(e => {
    //       console.error(`Failed to create discount for stripe customer '${stripeCustomerId}' and invoiceId '${invoiceId}'`, e.stack);
    //       throw e;
    //     })
    //   }))
    //   await Promise.all([p1, p2, p3]);
    //   return;
    // } catch (e) {
    //   console.error(`[OrderService] failed to process taxes and fees for order with invoiceId'${invoiceId}'`, e.stack);
    //   throw e;
    // }
  // }

  public async placeOrder(
    signedInUser: SignedInUser,
    cart: ICartInput,
    req?: IncomingMessage,
    res?: OutgoingMessage,
  ): Promise<MutationConsumerRes> {
    console.log(this.stripe);
    console.log(req, res);
    /**
     * when i get the searchArea, always save that to the consumer.
     * but...
     * serviceType === delivery
     *  order.location = searcharea
     * serviceType === pickup
     *  order.location = restaurant addr
     * 
     */
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
      return {
        res: null,
        error: validation
      }

      // const addr = cart.destination.address;
      // const fullAddrStr = Address.getFullAddrStr(
      //   addr.address1,
      //   addr.city,
      //   addr.state,
      //   addr.zip,
      //   addr.address2
      // )
      // let iPromo: IPromo | null = null;
      // let referralPromo: ReferralPromo | null = null;
      // if (cart.promo) {
      //   const promoRes = await this.redeemPromo(
      //     cart.promo,
      //     cart.phone,
      //     fullAddrStr
      //   );
      //   if (promoRes.error) {
      //     return {
      //       res: null,
      //       error: promoRes.error,
      //     }
      //   }
      //   iPromo = promoRes.iPromo;
      //   referralPromo = promoRes.referralPromo;
      // }

      // const {
      //   tags,
      //   schedules,
      //   mealPlans
      // } = cart.consumerPlan;

      // let stripeCustomerId = signedInUser.stripeCustomerId;
      // let subscription: Stripe.Subscription;
      // if (signedInUser.stripeSubscriptionId) {
      //   const msg = `Subscription '${signedInUser.stripeSubscriptionId}' already exists`;
      //   console.warn('[OrderService]', msg)
      //   return {
      //     res: null,
      //     error: msg
      //   }
      // }

      // if (!stripeCustomerId) {
      //   try {
      //     const stripeCustomer = await this.stripe.customers.create({
      //       payment_method: cart.paymentMethodId,
      //       email: signedInUser.profile.email,
      //       invoice_settings: {
      //         default_payment_method: cart.paymentMethodId,
      //       },
      //     });
      //     stripeCustomerId = stripeCustomer.id;
      //   } catch (e) {
      //     console.error(`Failed to create stripe customer for consumer '${signedInUser._id}'`, e.stack);
      //     throw e;
      //   }
      // }
      
      // const geo = await this.geoService.getGeocode(
      //   addr.address1,
      //   addr.city,
      //   addr.state,
      //   addr.zip,
      // );
      // // - 60 seconds for extra buffer
      // const billingStartDateSeconds = Math.floor(moment().tz(geo.timezone).endOf('d').valueOf() / 1000) - 60;
      // const newSub: Stripe.SubscriptionCreateParams = {
      //   proration_behavior: 'none',
      //   // start the billing cycle at the end of the day so we always guarantee that devlieres are confirmed before
      //   // invoice creation. for example, if a customer signed up at 12am, they would have a billing cycle of 12 am so
      //   // it's possible that stripe creates the invoice before all deliveires were confirmed for 12am.
      //   billing_cycle_anchor: billingStartDateSeconds,
      //   customer: stripeCustomerId,
      //   items: mealPlans.map(mp => ({ plan: mp.stripePlanId }))
      // }
      // if (iPromo) {
      //   if (iPromo.duration === 'once') {
      //     newSub.metadata = {
      //       [oncePromoKey]: iPromo.stripeCouponId
      //     };
      //   } else {
      //     newSub.coupon = iPromo.stripeCouponId;
      //   }
      // }
      // try {
      //   subscription = await this.stripe.subscriptions.create(newSub);
      // } catch (e) {
      //   console.error(`Failed to create stripe subscription for consumer '${signedInUser._id}'`
      //                 + `with stripe customerId '${stripeCustomerId}'`, e.stack);
      //   throw e;
      // }

      // let plans: IPlan[];
      // try {
      //   plans = await this.planService.getAvailablePlans();
      // } catch (e) {
      //   console.error(`Failed to get available plans: '${e.stack}'`);
      //   throw e;
      // }

      // let newReferralPromo;
      // try {
      //   newReferralPromo = await this.stripe.coupons.create({
      //     name: signedInUser.profile.name + ' Referral',
      //     amount_off: referralFriendAmount,
      //     duration: 'repeating',
      //     duration_in_months: referralMonthDuration,
      //     currency: 'usd',
      //     metadata: {
      //       userId: signedInUser._id,
      //       amountOff: referralSelfAmount,
      //       percentOff: null,
      //     } as ReferralSource
      //   });
      // } catch (e) {
      //   console.error(`[OrderService] failed to create referral coupon for '${signedInUser._id}'`, e.stack);
      //   throw e;
      // }
  
      // const mealPrices = MealPrice.getMealPrices(mealPlans, plans);
      // const consumer: EConsumer = {
      //   createdDate: Date.now(),
      //   stripeCustomerId,
      //   stripeSubscriptionId: subscription.id,
      //   plan: ConsumerPlan.getEConsumerPlanFromIConsumerPlanInput(
      //     {
      //       mealPlans,
      //       schedules,
      //       tags,
      //     },
      //     newReferralPromo.id,
      //     [],
      //     subscription.items.data.reduce<{ [key: string]: string }>((sum, subItem) => {
      //       sum[subItem.plan.id] = subItem.id;
      //       return sum;
      //     }, {}),
      //   ),
      //   profile: {
      //     name: signedInUser.profile.name,
      //     email: signedInUser.profile.email,
      //     phone: cart.phone,
      //     card: cart.card,
      //     destination: {
      //       ...cart.destination,
      //       geo: {
      //         lat: geo.lat,
      //         lon: geo.lon,
      //       },
      //       timezone: geo.timezone
      //     },
      //   }
      // };
      // const newOrderPromos = iPromo ? [ iPromo ] : [];
      // const order = Order.getNewOrder(
      //   signedInUser._id,
      //   consumer,
      //   cart.deliveries,
      //   cart.donationCount,
      //   moment(billingStartDateSeconds * 1000).add(1, 'w').valueOf(),
      //   mealPrices,
      //   newOrderPromos,
      //   [],
      //   // make updated date 5 seconds past created date to indicate
      //   // non auto generated order. this is a hack
      //   moment().valueOf(),
      //   moment().add(5, 's').valueOf(),
      // );
      // const indexer = this.elastic.index({
      //   index: ORDER_INDEX,
      //   body: order
      // }).catch(e => {
      //   console.error(`Failed to index new order ${JSON.stringify(order)}`, e.stack)
      //   throw e;
      // });
      // this.addAutomaticOrder(
      //   signedInUser._id,
      //   1,
      //   consumer,
      //   moment(billingStartDateSeconds * 1000).add(2, 'w').valueOf(),
      //   mealPrices,
      //   (iPromo && iPromo.duration !== 'once') ? newOrderPromos : [],
      //   [],
      // ).catch(e => {
      //   console.error(`[OrderService] could not auto generate order from placeOrder by cuisines`, e.stack)
      // });
      // const consumerUpserter = this.consumerService.upsertConsumer(signedInUser._id, signedInUser.permissions, consumer);
      // const consumerAuth0Updater = this.consumerService.updateAuth0MetaData(signedInUser._id, subscription.id, stripeCustomerId);
      // await Promise.all([consumerUpserter, indexer, consumerAuth0Updater]);
      // if (referralPromo) {
      //   const source = referralPromo.referralSource;
      //   const discount: IDiscount = {
      //     description: `Thanks for inviting ${signedInUser.profile.name.split(' ')[0]}`,
      //     amountOff: source.amountOff,
      //     percentOff: source.percentOff,
      //     reason: DiscountReasons.ReferredAFriend,
      //     referredUserId: signedInUser._id,
      //   };
      //   if (source.amountOff) {
      //     const weeklyDiscounts: IWeeklyDiscount[] = [
      //       {
      //         discounts: [
      //           discount,
      //           discount,
      //           discount,
      //           discount,
      //         ]
      //       }
      //     ];
      //     this.addWeeklyDiscountsToUpcomingOrders(source.userId, weeklyDiscounts)
      //       .then(remainingWeeklyOrders => {
      //         if (!this.consumerService) {
      //           const err = new Error ('ConsumerService not set');
      //           console.error(err.stack);
      //           throw err;
      //         };
      //         return this.consumerService.attachDiscountsToPlan(
      //           source.userId,
      //           remainingWeeklyOrders,
      //           false,
      //         );
      //       })
      //       .catch(e => {
      //         console.error(`Failed to add discounts to upcoming orders and consumer plan for '${source.userId}'`, e.stack);
      //       });
      //   } else {
      //     console.error(`[OrderService] referralPromo '${referralPromo.stripeCouponId}' missing amount off`);
      //   }
      // }
      // // refresh access token so client can pick up new fields in token
      // if (req && res) await refetchAccessToken(req, res);
      // return {
      //   res: Consumer.getIConsumerFromEConsumer(signedInUser._id, signedInUser.permissions, consumer),
      //   error: null
      // };
    } catch (e) {
      console.error(`[OrderService] could not place order for ${signedInUser._id}`, e.stack);
      throw new Error('Internal Server Error');
    }
  }

  async getUpcomingEOrders(userId?: string): Promise<{ _id: string, order: EOrder }[]> {
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
      return res.body.hits.hits.map(({ _id, _source }) => ({
        _id,
        order: _source,
      }));
    } catch (e) {
      console.error(`[OrderService] couldn't get upcoming EOrders for consumer '${userId}'. '${e.stack}'`);
      throw new Error('Internal Server Error');
    }
  }

  async getAllPaidIOrders(signedInUser: SignedInUser): Promise<IOrder[]> {
    try {
      if (!signedInUser) throw getNotSignedInErr();
      if (!signedInUser.permissions.includes(Permissions.readAllOrders)) throw new Error('Not allowed');
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
                      exists: {
                        field: 'stripeInvoiceId'
                      }
                    }
                  ]
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
      return res.body.hits.hits.map(({ _id, _source }) => Order.getIOrderFromEOrder(_id, _source));
    } catch (e) {
      console.error(`[OrderService] couldn't get upcoming EOrders for consumer '${signedInUser?._id}'`, e.stack);
      throw e;
    }
  }

  async getAllUpcomingIOrders(signedInUser: SignedInUser): Promise<IOrder[]> {
    if (!signedInUser) throw getNotSignedInErr();
    if (!signedInUser.permissions.includes(Permissions.readAllOrders)) throw new Error('Not allowed');
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
                        'deliveries.deliveryDate': {
                          gte: 'now',
                          lt: moment().add(9, 'd').valueOf(),
                        }
                      },
                    },
                  ]
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
        }
      });
      const orders = res.body.hits.hits.map(({ _id, _source }) => Order.getIOrderFromEOrder(_id, _source));
      return orders.sort((o1, o2) => {
        if (o1.consumer.profile.name === o2.consumer.profile.name) return 0;
        if (o1.consumer.profile.name > o2.consumer.profile.name) return 1;
        return -1;
      });
    } catch (e) {
      console.error(`[OrderService] couldn't get upcoming IOrders for consumer '${signedInUser._id}'. '${e.stack}'`);
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

  // async getMySpent(signedInUser: SignedInUser): Promise<ISpent> {
  //   try {
  //     if (!signedInUser) throw new Error('Missing signed in user');
  //     const res: ApiResponse<SearchResponse<EOrder>>  = await this.elastic.search({
  //       index: ORDER_INDEX,
  //       size: 1000,
  //       body: getMyAllOrdersQuery(signedInUser._id)
  //     });
  //     const getEmptySpent = () => ({
  //       amount: 0,
  //       numMeals: 0,
  //       numOrders: 0,
  //     })
  //     return res.body.hits.hits.reduce<ISpent>((spent, { _source }) => {
  //       if (!_source.stripeInvoiceId) return spent;
  //       const orderSpent = _source.deliveries.reduce<ISpent>((orderSpent, d) => {
  //         if (d.status !== 'Confirmed') return orderSpent;
  //         const deliverySpent = d.meals.reduce<ISpent>((deliverySpent, m) => {
  //           // compare plan names instead of planIds because ids may be different for consumers with grandfathered pricing
  //           const mealPrice = _source.costs.mealPrices.find(mp => mp.planName === m.planName);
  //           if (!mealPrice) throw new Error('Missing meal price');
  //           return {
  //             amount: deliverySpent.amount + mealPrice.mealPrice * m.quantity,
  //             numMeals: deliverySpent.numMeals + m.quantity,
  //             numOrders: 0,
  //           }
  //         }, getEmptySpent());
  //         return {
  //           amount: orderSpent.amount + deliverySpent.amount,
  //           numMeals: orderSpent.numMeals + deliverySpent.numMeals,
  //           numOrders: 0,
  //         }
  //       }, getEmptySpent());
  //       return {
  //         amount: spent.amount + orderSpent.amount + _source.costs.deliveryFee,
  //         numMeals: spent.numMeals + orderSpent.numMeals,
  //         numOrders: spent.numOrders + 1,
  //       }
  //     }, getEmptySpent());
  //   } catch (e) {
  //     console.error(`[OrderService] Failed to get my spent for '${signedInUser?._id}'`, e.stack)
  //     throw new Error('Internal Server Error');
  //   }
  // }


  // async setOrderStripePaymentId(orderId: string, invoiceId: string): Promise<void> {
    // try {
    //   const newOrder: Pick<EOrder, 'stripeInvoiceId'> = {
    //     stripeInvoiceId: invoiceId,
    //   }
    //   await this.elastic.update({
    //     index: ORDER_INDEX,
    //     id: orderId,
    //     body: {
    //       doc: newOrder,
    //     }
    //   });
    // } catch (e) {
    //   console.error(`[OrderService] failed to setOrderStripeInvoiceId for orderId '${orderId}' and invoiceId '${invoiceId}'`, e.stack);
    //   throw e;
    // }
  // }

  // async updateUpcomingOrdersProfile(signedInUser: SignedInUser, profile: IConsumerProfile): Promise<MutationBoolRes> {
  //   if (!signedInUser) throw getNotSignedInErr()
  //   try {
  //     await this.elastic.updateByQuery({
  //       index: ORDER_INDEX,
  //       body: {
  //         query: getUpcomingOrdersQuery(signedInUser._id),
  //         script: {
  //           source: 'ctx._source.consumer.profile = params.profile',
  //           lang: 'painless',
  //           params: {
  //             profile
  //           }
  //         },
  //       }
  //     });
  //     return {
  //       res: true,
  //       error: null
  //     }
  //   } catch(e) {
  //     console.error(`[OrderService]: Couldn't update UpComingOrders for '${signedInUser._id}'`, e.stack);
  //     throw new Error('Internal Server Error');
  //   } 
  // }
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
      apiVersion: '2020-08-27',
    })
  );
  orderService!.setConsumerService(getConsumerService());
  orderService!.setGeoService(getGeoService());
  orderService!.setPlanService(getPlanService());
  orderService!.setRestService(getRestService());
  return orderService;
}
