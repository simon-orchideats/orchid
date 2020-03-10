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
            // billing_cycle_anchor: Math.round(moment(cart.deliveryDate).subtract(2, 'd').valueOf() / 1000), // stripe uses seconds
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

  private async getOrder(orderId: string, fields?: string[]) {
    const options: any = {
      index: ORDER_INDEX,
      id: orderId,
    };
    if (fields) options._source = fields;
    try {
      const res: ApiResponse<EOrder> = await this.elastic.getSource(options);
      const order: any = res.body;
      order._id = orderId;
      return order as IOrder;
    } catch (e) {
      console.error(`[OrderService] failed to get order '${orderId}'`, e.stack);
      return null;
    }
  }

        
/**
 * - weekN update
 *    - did consumer pay for weekN yet?
 *      - yes
 *        - invoice for weekN+1.
 *        - is there already a "modification" invoice for weekN+1?
 *            -yes
 *              remove it
 *        // it's possible theres weekN contains weekN-1 invoices and we ignore them from the math.
 *        // those are a done deal
 *        - upgrade = create invoice for (newPlanPrice - (weekNPlan + weekNINvoices))
 *        - downgrade = create invoice for (newPlanPrice - (weekNPlan + weekNINvoices))
 *        - maintain
 *        - skip = create invoice for (0 - (weekNPlan + weekNINvoices))
*             - add if there's an invoice, add it to weekN+1
*        
*      no
*        - invoice for weekN
*        - is there already a "modification" invoice for weekN?
*            - yes
*              - remove it
*        - upgrade = create invoice for (newPlanPrice - original weekNPlan)
*        - downgrade = create invoice for (newPlanPrice - original weekNPlan)
*        - maintain
*        - skip = create invoice for (0 - original weekNPlan)
*        - if we just created a invoice, add it to weekN
* 
* 
*  get upcoming invoice
*    loop through line items, 
*      is there item where description contains "Plan adjustment" 
*      yes
*        delete invoice item stripe.invoiceItems.del
*      subPlanPrice = get plan from loop  
* 
*    is now within the currInvoice period?
*      yes (updating this week)
*        basePrice = subPlanPrice 
*  
*      no (updating next week)
*        prevInvoice = list all invoices, and get the most recent invoice
*        prevPlanPrice = prevIncoice.lineItems.plan
*        prevInvoiceTotal = loop through all invoice items and grab the one that contains "Plan adjustment"
*        basePrice =  prevPlanPrice + prevInvoiceTotal
*        
* 
*    // new plan price is 0 when skipping
*    create invoie item (newPlanPrice - basePrice) and add to upcoming invoice
* 
* 
* 
* given week, modify week
* 
* w1, w1 - upgrade w1 40 -> 80, so gets INVOICED w1 (80 - 40) = 40
* 
* w1, w1 - upgrade w1 again to 150, remove w1 prevInvoice (40) and reinvoice w1 (150 - 40) = 90
* 
* w1, w1 - downgrade w1 all the way to 40, remove w1 prevInvoice (90) and reinvoice w1 (40 - 40) = 0;
* 
* w1, w1 - upgrade w1 to 80, remove w1 prevInvoice(0) and reinvoice w1 (80 - 40) = 40
* 
* ---------W1 STILL NOT SHIPPED, BUT CUST PAID 80 TOTAL (40(plan) + 40(inv)) ----------
* 
* w2, w1 - upgrade w1 to 150, invoice w2 (150 - 80) = 70
* 
* w2, w1 - downgrade w1 to 80, invoice w2 (80 - 80) = 0 (THIS IS RIGHT SINCE THEY ALREADY PAID 80)
* 
* w2, w1 - downgrade w1to 40, invoice w2 (40 - 80) = -40
* 
* w2, w1 - skip, w1 invoice w2 (0 - 80) = -80
* 
* 
* --------------- W1 done. final is skip so invoiced -80 to cover overpayment of 80 in w1------------
* 
* w2, w2 - upgrade w2 40 -> 150, so gets invoiced w2 150 - 40 = 110
* 
* w2, w2 - downgrade w2 150 -> 80, so remove w2 prevInvoice (110) and reinvoice reinvoice w2 (80 - 40) = 40
* 
* -----------W2 STILL NOT SHIPPED BUT CUST PAID -80 (from w1) + 40 (from w2) = -40 ------------
* 
* // this is correct because customer is invoiced the -40 to counter the 40 in w2.
* w3, w2 - skip w2, invoice w3 (0 - 40 [40 because w2 payment for w2 stuff [ignoring w1 invoice within w2] is 40]) = -40
* 
* // this correct cuz customer's w2 progression is 40 -> 150 -> 80 -> 0 -> 40.
* w3, w2 - upgrade w2 40, remove w3 prevInvoice (-40) and invoice w3 (40 - 40+40 [40 + 40 because original w2 + w2's specific modificaiton invoices]) = 40
*                                                          
* w3, w3 - upgrade w3 to 80, NO W3 TARGET invoice (only w2), invoice w3 (80 - 40) = 40
* 
* --------------W2 SHIPS AND W3 PAID. FINAL W2 = 40, W3 = 80 (40 + 40)
* 
* 
* 
* 
* 
* 
* 
* 
*/
  
  async updateOrder(signedInUser: SignedInUser, orderId: string, cart: ICartInput): Promise<MutationBoolRes> {
    try {
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
  
      const oldOrder = await this.getOrder(orderId);
      if (!oldOrder) throw new Error(`Couldn't get order '${orderId}'`);

      // const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      const upcomingInvoice = await this.stripe.invoices.retrieveUpcoming({ customer: signedInUser.stripeCustomerId });
      const upcomingAdjustment = upcomingInvoice.lines.data.find(line => line.description && line.description.includes('Plan adjustment'))
      if (upcomingAdjustment) {
        await this.stripe.invoiceItems.del(upcomingAdjustment.id);
      }
      let prevPrice;
      const now = Date.now();
      if (now > upcomingInvoice.period_start && now < upcomingInvoice.period_end) {
        prevPrice = upcomingInvoice.lines.data.find(line => !!line.plan)!.amount / 100;
      } else {
        const prevInvoices = await this.stripe.invoices.list({
          limit: 1,
          customer: stripeCustomerId
        });
        const prevAdjustment = prevInvoices.data[0].lines.data.find(line => line.description && line.description.includes('Plan adjustment'))
        const prevPlan = prevInvoices.data[0].lines.data.find(line => !!line.plan)
        if (!prevPlan) throw new Error('BADDDD');
        prevPrice = (prevPlan.amount + (prevAdjustment ? prevAdjustment.amount : 0)) / 100;
      }
      const newPlan = await getPlanService().getPlan(cart.consumerPlan.stripePlanId);
      if (!newPlan) throw new Error('BADDDD');
      await this.stripe.invoiceItems.create({
        customer: stripeCustomerId,
        amount: newPlan.weekPrice - prevPrice,
        description: 'Plan Adjustment',
        subscription: subscriptionId,
      });
      return {
        res: true,
        error: null,
      }
    } catch (e) {
      console.error(`[OrderService] couldn't updateOrder for '${orderId}' with cart '${cart}'`, e.stack);
      throw new Error('Internal Server Error');
    }
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
