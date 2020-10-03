import { PlanRoles } from './../../consumer/consumerPlanModel';
import { ELocation } from './../../place/locationModel';
import { ERest } from './../../rest/restModel';
import { IncomingMessage, OutgoingMessage } from 'http';
import { IAddress } from './../../place/addressModel';
import { EOrder, IOrder, Order } from './../../order/orderModel';
import { getPlanService, IPlanService } from './../plans/planService';
import { Permissions, EConsumer } from './../../consumer/consumerModel';
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
import { refetchAccessToken } from '../../utils/auth';
import { OrderMeal } from '../../order/orderRestModel';

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

type validatedRest = Pick<
  ERest,
  'featured'
  | 'taxRate'
  | 'deliveryFee'
  | 'deliveryMinimum'
  | 'stripeRestId'
  | 'location'
>;

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
  private async validateRest(cart: ICartInput): Promise<{
    msg: string | null,
    rest: validatedRest | null,
  }> {
    if (!this.restService) return Promise.reject('RestService not set');
    const cartRest = cart.cartOrder.rest
    const rest: validatedRest | null = await this.restService.getERest(cartRest.restId, [
      'featured',
      'taxRate',
      'deliveryFee',
      'deliveryMinimum',
      'stripeRestId',
      'location',
    ]);
    if (!rest) {
      const msg = `Can't find rest '${cartRest.restId}'`
      console.warn('[OrderService]', msg);
      return {
        msg,
        rest: null,
      };
    }
    return {
      msg: null,
      rest,
    }
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

  private async validateCart(cart: ICartInput): Promise<{
    msg: string | null,
    rest: validatedRest | null,
  }> {
    const phoneValidation = validatePhone(cart.phone);
    if (phoneValidation) {
      return {
        msg: phoneValidation,
        rest: null,
      }
    };
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
    // if (cart.restId) p1 = this.validateRest(cart);
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

    return this.validateRest(cart);
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
                  }
                ],
              }
            }
          }
        },
        sort: [
          {
            cartUpdatedDate: {
              order: 'desc',
            }
          }
        ],
      }
    });
    return res.body.hits.hits.map(({ _id, _source }) => Order.getIOrderFromEOrder(_id, _source));
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

  private async makePayment(
    cart: ICartInput,
    stripeCustomerId: string,
    stripeRestId: string | null
  ): Promise<string> {
    try {
      const mealTotal = OrderMeal.getTotalMealCost(cart.cartOrder.rest.meals);
      const taxes = mealTotal * cart.cartOrder.rest.taxRate;
      const total = Math.round(mealTotal + taxes + cart.cartOrder.rest.deliveryFee);
      const options: Stripe.PaymentIntentCreateParams = {
        payment_method: cart.paymentMethodId,
        customer: stripeCustomerId,
        confirm: true,
        confirmation_method: 'manual',
        statement_descriptor_suffix: cart.cartOrder.rest.restName,
        setup_future_usage: 'off_session',
        amount: total,
        currency: 'usd',
      };
      if (stripeRestId) {
        options.transfer_data = {
          destination: stripeRestId
        }
      }
      const paymentIntent = await this.stripe.paymentIntents.create(options);
      if (paymentIntent.status === 'succeeded') return paymentIntent.id;
      throw new Error(`PaymentIntent has status '${paymentIntent.status}'`);
    } catch (e) {
      throw new Error(`Failed to make payment. ${e.message}`);
    }
  }

  public async placeOrder(
    signedInUser: SignedInUser,
    cart: ICartInput,
    req?: IncomingMessage,
    res?: OutgoingMessage,
  ): Promise<MutationConsumerRes> {
    if (!signedInUser) throw getNotSignedInErr();
    if (!this.consumerService) throw new Error ('ConsumerService not set');
    if (!this.restService) throw new Error ('RestService not set');
    if (!this.planService) throw new Error('PlanService not set');
    if (!this.geoService) throw new Error('GeoService not set');
    const validation = await this.validateCart(cart);
    const rest = validation.rest;
    if (!rest || validation.msg) {
      return {
        res: null,
        error: validation.msg,
      }
    }

    let stripeCustomerId = signedInUser.stripeCustomerId;
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

    let subscriptionId = signedInUser.stripeSubscriptionId;
    if (!subscriptionId) {
      if (!cart.stripeProductPriceId) {
        // this is possible when the consumer is newly added to another's plan
        // todo pivot: get the subId from the db and set use it to refresh the tokens
        subscriptionId = 'temporary';
      } else {
        try {
          const subscription = await this.stripe.subscriptions.create({
            proration_behavior: 'none',
            customer: stripeCustomerId,
            trial_period_days: 30,
            items: [{
              price: cart.stripeProductPriceId
            }]
          });
          subscriptionId = subscription.id;
        } catch (e) {
          console.error(`Failed to create stripe subscription for consumer '${signedInUser._id}'`
                        + `with stripe customerId '${stripeCustomerId}'`, e.stack);
          throw e;
        }
      }
    }
    const geo = await this.geoService.getGeocodeByQuery(cart.searchArea);
    if (!geo) {
      return {
        res: null,
        error: `Couldn't verify address '${cart.searchArea}'`
      }
    }
    const searchArea: ELocation = {
      primaryAddr: cart.searchArea,
      address2: cart.address2,
      geoPoint: {
        lat: geo.lat,
        lon: geo.lon
      },
      timezone: geo.timezone,
    };
    const paymentId = await this.makePayment(cart, stripeCustomerId, rest.stripeRestId);
    const order = Order.getEOrder(
      signedInUser,
      searchArea,
      cart,
      rest,
      paymentId
    );
    const orderAdder = this.elastic.index({
      index: ORDER_INDEX,
      body: order
    }).catch(e => {
      console.error(`Failed to index new order ${JSON.stringify(order)}`, e.stack)
      throw e;
    });
    const consumer: Partial<EConsumer> = {
      stripeCustomerId: signedInUser.stripeCustomerId ? undefined : stripeCustomerId,
      plan: cart.stripeProductPriceId ?
        {
          stripeSubscriptionId: subscriptionId,
          role: PlanRoles.Owner,
          stripeProductPriceId: cart.stripeProductPriceId,
        }
        :
        undefined,
      profile: {
        name: signedInUser.profile.name,
        email: signedInUser.profile.email,
        phone: cart.phone,
        card: cart.card,
        serviceInstructions: cart.cartOrder.serviceInstructions,
        searchArea,
      }
    };
    const consumerUpdater = this.consumerService.updateConsumer(
      signedInUser._id,
      signedInUser.permissions, 
      consumer
    );
    // todo pivot. this is a bad check. for new customers who were recently added to a plan, they wont have stripePRoductPriceId
    // but they will have subscription. they also wont have stripeCustomerId.
    // anothe rproblem is that if the newly added account's token will be old and the token
    // wont have the proper stripeSubId in it so when added account places order, we wont see tokens
    if (cart.stripeProductPriceId) {
      await this.consumerService.updateAuth0MetaData(
        signedInUser._id,
        subscriptionId,
        stripeCustomerId
      );
      // refresh access token so client can pick up new fields in token
      if (req && res) await refetchAccessToken(req, res);
    }
    const [iConsumer] = await Promise.all([
      consumerUpdater,
      orderAdder
    ]);
    return {
      res: iConsumer,
      error: null
    };
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
