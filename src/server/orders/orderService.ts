// @ts-nocheck

import { EOrder, IOrder } from './../../order/orderModel';
import { IMeal } from './../../rest/mealModel';
import { getPlanService } from './../plans/planService';
import { RenewalTypes } from './../../consumer/consumerModel';
import { SignedInUser } from './../utils/models';
import { getConsumerService } from './../consumer/consumerService';
import { ICartInput, Cart } from './../../order/cartModel';
import { getGeoService } from './../place/geoService';
import { getRestService } from './../rests/restService';
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

const validateCart = async (cart: ICartInput) => {
  if (!cart.phone) {
    const msg = getCannotBeEmptyError('Phone number');
    console.warn('[OrderService]', msg);
    return msg;
  }
  if (!Consumer.isDeliveryDayValid(cart.consumerPlan.deliveryDay)) {
    const msg = `Delivery day '${cart.consumerPlan.deliveryDay}' must be 0, 1, 2, 3, 4, 5, 6`;
    console.warn('[OrderService]', msg);
    return msg;
  }
  if (!isDate2DaysLater(cart.deliveryDate)) {
    const msg = `Delivery date '${cart.deliveryDate}' is not 2 days in advance`;
    console.warn('[OrderService]', msg);
    return msg;
  }

  const p1 = getRestService().getRest(cart.restId, ['menu']).then(rest => {
    if (!rest) {
      const msg = `Can't find rest '${cart.restId}'`
      console.warn('[OrderService]', msg);
      return msg;
    }
    for (let i = 0; i < cart.meals.length; i++) {
      if (!rest.menu.find(meal => meal._id === cart.meals[i].mealId)) {
        const msg = `Can't find mealId '${cart.meals[i].mealId}'`
        console.warn('[OrderService]', msg);
        return msg;
      }
    }
    return '';
  }).catch(e => {
    const msg = `Couldn't find rest '${cart.restId}'`
    console.warn('[OrderService]', msg, e.stack);
    return msg;
  });
  
  const {
    address1,
    city,
    state,
    zip,
  } = cart.destination.address;
  const p2 = getGeoService().getGeocode(address1, city, state, zip)
    .then(() => '')  
    .catch(e => {
      const msg = `Couldn't verify address '${address1} ${city} ${state}, ${zip}'`
      console.warn('[OrderService]', msg, e.stack);
      return msg;
    })

  const planId = cart.consumerPlan.stripePlanId;
  const cartMealCount = Cart.getMealCount(cart.meals);
  const p3 = getPlanService().getPlan(planId)
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

class OrderService {
  private readonly elastic: Client
  private readonly stripe: Stripe

  public constructor(elastic: Client, stripe: Stripe) {
    this.elastic = elastic;
    this.stripe = stripe;
  }

  async placeOrder(signedInUser: SignedInUser, cart: ICartInput): Promise<MutationBoolRes> {
    try {
      const validation = await validateCart(cart);
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
      let eConsumer = {
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
      };

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
            billing_cycle_anchor: Math.round(moment(cart.deliveryDate).subtract(2, 'd').valueOf() / 1000), // stripe uses seconds
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
        subscription.id,
        parseFloat(subscription.plan!.metadata.mealPrice),
        subscription.plan!.amount! / 100,
      );
      const indexer = this.elastic.index({
        index: ORDER_INDEX,
        body: order
      })
      const consumerInserter = getConsumerService().insertConsumer(signedInUser.userId, {
        stripeCustomerId,
        stripeSubscriptionId: subscription.id,
        ...eConsumer
      });

      if (cart.consumerPlan.renewal === RenewalTypes.Auto) {
        getRestService().getRestsByCuisines(cart.consumerPlan.cuisines, ['menu'])
          .then(rests => {
            if (rests.length === 0) throw new Error(`Rests of cuisine '${JSON.stringify(cart.consumerPlan.cuisines)}' is empty`)
            const rest = rests[Math.floor(Math.random() * rests.length)];
            const menu = rest.menu;
            const chooseRandomly = getItemChooser<IMeal>(menu);
            const meals: IMeal[] = [];
            for (let i = 0; i < Cart.getMealCount(cart.meals); i++) meals.push(chooseRandomly())
            const cartMeals = Cart.getCartMeals(meals);
            const newCart = {
              ...cart,
              restId: rest._id,
              meals: cartMeals,
              deliveryDate: moment(cart.deliveryDate).add(1, 'w').valueOf(),
            }
            const order = Order.getNewOrderFromCartInput(
              signedInUser,
              newCart,
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

      await Promise.all([consumerInserter, indexer]);

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
                        'consumer.userId': signedInUser.userId
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
        const rest = await getRestService().getRest(_source.rest.restId)
        if (!rest) throw Error(`Couldn't get rest ${_source.rest.restId}`);
        return Order.getIOrderFromEOrder(_id, _source, rest)
      }))
    } catch (e) {
      console.error(`[OrderService] couldn't get upcoming orders for '${signedInUser.userId}'. '${e.stack}'`);
      throw new Error('Internal Server Error');
    }
  }
  
  async updateOrder(signedInUser: SignedInUser, orderId: string, cart: ICartInput): Promise<MutationBoolRes> {
    const validation = await validateCart(cart);
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

    /**
     * 
     * get the order. make sure it's not status === confirmed. make sure it's deliveryDate is after 2 days.
     * 
     * updating an order does NOTHING for the other orders. it simply updates the singular orer. if you want to 
     * update the plan, then do so via the profile. but this is problematic because if i change the delivery date,
     * then it also affects NEXTNEXT...
     * 
     * ex: assume today is the 24th.. and next = 27 and nextnext = 3/5. and i update delivery to 3/4.
     * well now theres a delivery on 3/4, to be paid for on 3/2. but what about the delivery for 3/5?
     * 
     * so how can i update each one independently?
     * 
     * /////////////////////////////////////IDEA 1/////////////////////
     * so updating next
     *  - is delivery day different or plan different?
     *      - day different
     *          - add a coupon FOR JUST THIS WEEK to skip it
     *          - existing invoice? if yes update it, otherwise create
     *          - create invoice. this invoice gets tacked onto the next bill
     *      - plan upgrade
     *          - existing invoice? if yes update it, otherwise create
                - create invoice. this invoice gets tacked onto the next bill
     *      - plan downgrade
     *          - existing invoice? if yes update it, otherwise create
                - create invoice, this invoice gets tacked onto the next bill
     *      - both different
     *          - same as a single upgrade /downgrade
     *      - always
     *  - waht if i keeep updating it...? i just gotta prevent picking dDates past the next dDate.
     *  - what if i try to update nextnext after updating next?
     *    - doesnt matter. that affects nextnext. not next.
     *        
     * 
     *      - none different
     *        - just update the order in db
     * 
     *  
     *  - put on a schedule.
     *    - is the delivery day different?
     *        yes
     * 
     *         no
     *    - is the plan different?
     *        yes
     * 
     * 
     * 
     *        no
     *          
     * updating nextnext
     *  - update
     * 
     * //////////////////////////////////////////////////////////////////////////////
     * 
     * 
     * 
     * ////////////////////// USE CASES FOR IDEA 1 //////////////////////
     * 
     * 
     * 
     * ex: 
     * today = 24
     * next = 27
     * nextnext = 3/5.
     * 
     * i update NEXT (27)  to 3/4. this is the latest possible
     * 
     * skip this week's payment on 25. by applying a 100% coupon.
     * 
     * make invoice for the update. (make sure it's not discountable)
     *    -if nothing else happens,then we're good cuz on 3/3 we'll pay for it.
     * 
     * consumer can keep updating as much as he wants order confirmation, then no longer update. on
     * each update, just update the invoice 3/3. if it's skipped then we remove hte invoice.
     * 
     * so say the consumer then updates delivery to sat 29. then we just update data and possibly
     * the invoice (if plan changed).
     * 
     * 
     * 
     * 
     * 
     * UPDATING NEXTNEXT
     *  - this is applicable everytime there's a preceding delivery, no matter when the preceding delivery
     *  is.
     * 
     *  - grab the billing date, given the dDate.
     *   - is it the next billing date?
     *      yes
     *        - possible when next billing date has already passed but food not delivered.
     *      no
     *        -this is the case if im updating it first
     *      -both
     *          or i could just always create a scheudle, let's do that it's easier.
     * 
     *    - create a schedule that starts now and a phase that starts on the nextnext billing date. that
     *     phase will include a coupon of 100%. so if there's been a previous update to next then it'll still
     *    invoiced on this bDATE. this schedule simply SKIPS skips this bDATE similar to how we skip
     *    the date in next.
     *    - take the desired update and add an invoice to the nextnextnext's payment, by properly updating the
     *      nextnextnext phase in the schedule.
     * 
     * 
     * 
     * 
     * 
     * 
     * 
     * 
     *  FOR BOTH OF THESE.... instead of MAKING the invoice now, we shoudl store the invoice data.
     * then when we get an event signaling draft infovice, we grab the coreesponding invoice data from
     * db and use that. each db invioce just needs to store some date.
     * https://stripe.com/docs/billing/invoices/subscription#adding-draft-invoice-items
     * 
     * next
     *    is new delivery date past nextnext delivery?
     *        yes
     *          error
     *        no
     *          continue
     *    add 1 use coupon to this billing cycle
     *    put invoice item into db, tag it with nextnext billing date
     * 
     * when invoice 'invoice.created' event is received, check for any invoices in elastic with matching
     * date
     *    for any found, add them.
     * 
     * 
     * nextnext
     *    - detect this by finding if theres a previous delivery date
     *    - add coupon to the billing date for this dDate using scheduled sub.
     *    - put invoice item into db, and tag it with nextnextnext's billing date
     * 
     * 
     * when invoice 'invoice.created' event is received, check for any invoices in elastic with matching
     * date
     *    for any found, add them. be sure to specify the invoice when you add the new item
     * 
     * 
stripe.invoiceItems.create(
  {
    subscription: 'sub123',
    customer: 'cus_GnNoqL1OSGOfga',
    amount: 2500,
    description: 'One-time fee',
  },
  function(err, invoiceItem) {
    // asynchronously called
  }
);
     * 
     * 
     * 


     * 
     * //////////////////////////// IDEA 2 //////////////////////
     * 
     * ex: assume today is the 24th.. and next = 27 and nextnext = 3/5. and i update delivery to 3/4.
     * well now theres a delivery on 3/4, to be paid for on 3/2. but what about the delivery for 3/5?
     * 
     * next - screw it. we don't change any billing times. if they change plans AFTER the bill, then we
     * credit the next bill. they can never schedule next PAST original nextnext. also impossible to skip once paid for
     *    - update the order delivery date
     *    - did plan update?
     *      - generate invoice (+ if upgrade, - if downgrade)
     *        - this will affect 2/25 bill
     *    - if i change it again, generate another invoice of + or -.
     *    
     *    
     *      
     * 
     * nextnext - if they update this same applies. billing period does NOT change. this forces the payment of
     * any updates to next
     * 
     */
    
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    // subUpdater = this.stripe.subscriptions.update(subscriptionId, {
    //   proration_behavior: 'none',
    //   items: [{
    //     id: subscription.items.data[0].id,
    //     // plan: c,
    //   }]
    // });
    /**
     * cehck for singed in user, check for orderId, check that user exists in stripe
     */

  }
}

let orderService: OrderService;

export const initOrderService = (elastic: Client, stripe: Stripe) => {
  if (orderService) throw new Error('[OrderService] already initialized.');
  orderService = new OrderService(elastic, stripe);
};

export const getOrderService = () => {
  if (orderService) return orderService;
  initOrderService(initElastic(), new Stripe(activeConfig.server.stripe.key, {
    apiVersion: '2019-12-03',
  }));
  return orderService;
}
