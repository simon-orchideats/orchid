import { IAddress } from './../../place/addressModel';
import { EOrder, IOrder, IUpdateOrderInput } from './../../order/orderModel';
import { IMeal } from './../../rest/mealModel';
import { getPlanService } from './../plans/planService';
import { RenewalTypes } from './../../consumer/consumerModel';
import { SignedInUser } from './../utils/models';
import { getConsumerService } from './../consumer/consumerService';
import { ICartInput, Cart, ICartMeal } from './../../order/cartModel';
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

const validatePhone = (phone: string) => {
  if (!phone) {
    const msg = getCannotBeEmptyError('Phone number');
    console.warn('[OrderService]', msg);
    return msg;
  }
}

const validateDeliveryDate = (date: number) => {
  if (!isDate2DaysLater(date)) {
    const msg = `Delivery date '${date}' is not 2 days in advance`;
    console.warn('[OrderService]', msg);
    return msg;
  }
}

const validateRest = (restId: string, meals: ICartMeal[]) => getRestService().getRest(restId, ['menu'])
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

const validateAddress = ({
  address1,
  city,
  state,
  zip,
}: IAddress) => getGeoService().getGeocode(address1, city, state, zip)
  .then(() => '')  
  .catch(e => {
    const msg = `Couldn't verify address '${address1} ${city} ${state}, ${zip}'`
    console.warn('[OrderService]', msg, e.stack);
    return msg;
  })

const validatePlan = (planId: string, cartMealCount: number) => getPlanService().getPlan(planId)
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


const validateCart = async (cart: ICartInput) => {
  const phoneValidation = validatePhone(cart.phone);
  if (phoneValidation) return phoneValidation;
  const deliveryDateValidation = validateDeliveryDate(cart.deliveryDate);
  if (deliveryDateValidation) return deliveryDateValidation;

  if (!Consumer.isDeliveryDayValid(cart.consumerPlan.deliveryDay)) {
    const msg = `Delivery day '${cart.consumerPlan.deliveryDay}' must be 0, 1, 2, 3, 4, 5, 6`;
    console.warn('[OrderService]', msg);
    return msg;
  }

  const p1 = validateRest(cart.restId, cart.meals);
  const p2 = validateAddress(cart.destination.address);
  const p3 = validatePlan(cart.consumerPlan.stripePlanId, Cart.getMealCount(cart.meals));

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

const validateUpdateOrder = async (updateOptions: IUpdateOrderInput) => {
  const phoneValidation = validatePhone(updateOptions.phone);
  if (phoneValidation) return phoneValidation;
  const deliveryDateValidation = validateDeliveryDate(updateOptions.deliveryDate);
  if (deliveryDateValidation) return deliveryDateValidation;

  const p1 = validateRest(updateOptions.restId, updateOptions.meals);
  const p2 = validateAddress(updateOptions.destination.address);
  let p3;
  if (updateOptions.stripePlanId) {
    p3 = validatePlan(updateOptions.stripePlanId, Cart.getMealCount(updateOptions.meals));
  } else {
    p3 = Promise.resolve('');
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
      const consumerUpserter = getConsumerService().upsertConsumer(signedInUser.userId, {
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
        getRestService().getRestsByCuisines(cart.consumerPlan.cuisines, ['menu'])
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
      return res.body;
    } catch (e) {
      console.error(`[OrderService] failed to get order '${orderId}'`, e.stack);
      return null;
    }
  }

/**
 * 
 *        * final plan.never discount the modified week. even if the day is changed, we keep the same billing date.
       * once hte invoice.created event is published we you can no longer skip it. but you can still change the date
       * and change the meals. when changing date, dDate must be SAME OR BEFORE 2 days after the next billing date. (this
       * is to prevent infinite push-backs)
       * 
       * ex:
       * 
       * today is 2/26 and bDate is every thursday, so 2/27 followed by 3/5. so the farthest i can push back 2/27's order is
       * 3/7 and the last day i can change is 3/5
       * 
       * so assuming you are not skipping, any change you make updates the bill for 3/5 by either increasing or decreasing it.
       * increase when i change to a higher plan, and decrease when i change to a lower plan
       * 
       * 
       * repeat the same for nextnext. this works because for a given week, i awlays pay and i "catch up" on the next week.
       * if they cancel before the next week, i just need to make sure i force a remaining payment.
 * 
*       * use subscription.billing_cycle_anchor to determine if we're updating first or second upcomingOrder
       * 
       * FINAL PLAN 1 - USE SCHEDULES ONLY
       * 
       * first
       *  hasFirst already been billed?
       *    yes or no, doesn't matter. we treat this the same
  *         await this.stripe.subscriptionSchedules.create({
              customer: stripeCustomerId,
              start_date: 'first billing cycle + 1 d',
              phases: [
                { //PHASE 1 (week2)
                  plans: [
                    {
                      plan: '8 meal plan',
                      quantity: 1
                      coupon: isDowngrade ? week1paid - week1cost // if we week1 downgraded
                    } // original plan.
                    // if plan was unchanged then leave as is
                    {plan: '12 meal plan', quantity: 1} // if we upgraded (choose the proper downgrade, obv) $$$$$$$$$$$$$$$$$$$ NOOOO. this is NOT RIGHT. CUSTOMER OVERPAID!!!! $$$$$$$$$$$$ (unless i make a in-between plan which is a terrible idea cuz no way im gonna maintain that)
                  ],
                  iterations: 1,
                },
                { //PHASE 2 (week3)
                  plans: [
                    {plan: 'Gold special', quantity: 1}, // original plan to reset
                  ],
                  iterations: 1,
                },
              ],
            });
       * 
       *  
       * 
       * second
       *    did i update first?
       *      yes
       *        this means there's a schedule already
       *        find the current phase based on start/end of scheudle.start/end vs schedule.phases.start/end
       *        i'm in first phase
       *            - yes
       *                this means i haven't paid for week2 yet. so but either way, i still need to update phase2 as
       *                i need to migrate the changes to the cost of phase2 which represents week3
       *                
       * 
       *        im in second phase
       *            yes
       *                this means the first week has been taken care of and is done. AND i already paid for week2.
       *                so i need to move these changes into week3 by updating PHASE2 which is the phase for week3.
       * 
       *      no
       *        create a schedule
      *         await this.stripe.subscriptionSchedules.create({
                  customer: stripeCustomerId,
                  start_date: 'week2 billing cycle + 1 d',
                  phases: [
                    { //PHASE 1 //week3
                      plans: [
                        {plan: 'Gold special', quantity: 1} // original plan
                        {plan: '4 meal plan', quantity: 1} // if we upgraded (choose the proper downgrade, obv)
                        {plan: '12 meal plan', quantity: 1} // if we downgraded (choose the proper upgrade, obv)
                      ],
                      iterations: 1,
                    },
                    { //PHASE 2 //week4
                      plans: [
                        {plan: 'Gold special', quantity: 1}, // original plan to reset
                      ],
                      iterations: 1,
                    },
                  ],
                });
       * 
       * 
       *    
       * 
       * 
       * 
       * 
       * 
       * 
       * 
       * 
       * 
       * 
       * 
       * 
       * 
       * 
       * 
       * ANOTHER FINAL????? the plan is to make weekN handle it, otherwise make weekN +1 handle it
       * 
       * references
       *  https://stripe.com/docs/billing/subscriptions/discounts#other (negative invoices are allowed)
       * 
       * week1 update
       *    did customer pay for week1 yet?
       *      yes
       *        if upgrade - add invoice for (upgradePrice - week1Total) (affects week2)
       *        if downgrade - adds  invoice for (downgradePrice - week1Total ) (affects week2)
       *        if maintain - do nothing
       *      no
       *        if upgrade - add invoice for (upgradePrice - week1Total) (affects week1)
       *        if downgrade - add invoice for (downgradePrice - week1Total ) (affects week1)
       *        if maintain - do nothing
       * 
       * week2 update
       *    did customer update week1 after week1's payment? we only care about after week1's payment updates because
       *    otherwise week1's payment handled it already.
       *      yes
       *        this means there's an existing extra invoice. but this doesn't matter cuz we just add another invoice item
      *         did customer pay for week2 yet?
    *             yes
        *           if upgrade - add invoice for (upgradePrice - week1Total) (affects week2)
        *           if downgrade - adds invoice for (downgradePrice - week1Total ) (affects week2)
        *           if maintain - do nothing
        *           if skip - credit back all
      *           no
        *           if upgrade - add invoice for (upgradePrice - week1Total) (affects week3)
        *           if downgrade - adds invoice for (downgradePrice - week1Total ) (affects week3)
        *           if maintain - do nothing
       *      no-no problemo. just treat the same
    *         did customer pay for week2 yet?
  *             yes
      *           if upgrade - add invoice for (upgradePrice - week1Total) (affects week2)
      *           if downgrade - adds invoice for (downgradePrice - week1Total ) (affects week2)
      *           if maintain - do nothing
    *           no
      *           if upgrade - add invoice for (upgradePrice - week1Total) (affects week3)
      *           if downgrade - adds invoice for (downgradePrice - week1Total ) (affects week3)
      *           if maintain - do nothing
 */

        
/**
 * - weekN update (OLDDDDDDDDDDDDDDDDDDDDDDDD)
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




 * - weekN update (UPDATTTEEDDD-------------------------JKKKKKKKKKKKKKKK)
 *    - did consumer pay for weekN yet?
 *      - yes
 *        - invoice for weekN+1.
 *        - is there already a "modification" invoice for weekN+1?
 *            -yes
 *              remove it
  *       - upgrade = create invoice for (newPlanPrice - original weekNPlan)
  *       - downgrade = create invoice for (newPlanPrice - original weekNPlan)
 *        - maintain
*         - skip = create invoice for (0 - original weekNPlan)
*         - if we just created a invoice, add it to weekN
*        
*      no
*        - invoice for weekN
*        - is there already a "modification" invoice for weekN?
*            - yes
*              - remove it
 *       // it's possible theres weekN contains weekN-1 invoices and we ignore them from the math.
 *       // those are a done deal
 *       - upgrade = create invoice for (newPlanPrice - (weekNPlan + weekNINvoices))
 *       - downgrade = create invoice for (newPlanPrice - (weekNPlan + weekNINvoices))
*        - maintain
 *       - skip = create invoice for (0 - (weekNPlan + weekNINvoices))
*             ///// - add if there's an invoice, add it to weekN+1 wtf?
*        - add invoice to upcoming
* 








* 
* given week, modify week (UPDATEDDDDDDDDDDDDD ------------------------------------------------JKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK))
* 
* w1, w1 - upgrade w1 40 -> 80, so invoices w2, since w1 is already paid for, newPlan - w1Plan = 80 - 40 = 40
* 
* w1, w1 - upgrade w1 again to 150, remove w2 prevInvoice (40) and reinvoice w2, newPlan - w1Plan = 150 - 40 = 110
* 
* w1, w1 - downgrade w1 all the way to 40, remove w2 prevInvoice (90) and reinvoice w2, newPlan - w1Plan (40 - 40) = 0;
* 
* w1, w1 - upgrade w1 to 80, remove w2 prevInvoice(0) and reinvoice w2, newPlan - w1Plan = 80 - 40 = 40
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





* given week, modify week
* 
* w1, w1 - upgrade w1 40 -> 80, so gets INVOICED w1 (80 - 40) = 40
* 
* w1, w1 - upgrade w1 again to 150, remove targetW1prevInvoice (40) on w1 and reinvoice w1 (150 - 40) = 110
* 
* w1, w1 - downgrade w1 all the way to 40, remove targetW1prevInvoice (110) on w1 and reinvoice w1 (40 - 40) = 0;
* 
* w1, w1 - upgrade w1 to 80, remove targetW1prevInvoice(0) on w1and reinvoice w1 (80 - 40) = 40
* 
* ---------W1 STILL NOT SHIPPED, BUT CUST PAID 80 TOTAL (40(plan) + 40(inv)) ----------
* 
* w2, w1 - upgrade w1 to 150, invoice w2 (150 - 80) = 70
* 
* w2, w1 - downgrade w1 to 80, remove targetW1prevInvoice(70) on w2, invoice w2 (80 - 80) = 0 (THIS IS RIGHT SINCE THEY ALREADY PAID 80)
* 
* w2, w1 - downgrade w1 to 40, remove targetW1prevInvoice(0) w2, invoice w2 (40 - 80) = -40
* 
* w2, w1 - skip w1, remove targetW1prevInvoice(-40) invoice w2 (0 - 80) = -80
* 
* 
* --------------- W1 done. final is skip so invoiced -80 to cover overpayment of 80 in w1------------
* 
* w2, w2 - upgrade w2 40 -> 150, so gets invoiced w2 150 - 40 = 110
* 
* w2, w2 - downgrade w2 150 -> 80, so remove w2 prevInvoice (110) and reinvoice reinvoice w2 (80 - 40) = 40
* 
* -----------W2 STILL NOT SHIPPED BUT CUST PAID -80 (from w1) + 80 (from w2, 40 + 40) = -80 ------------
* 
* // this is correct because customer is invoiced the -80 to counter the 80 in w2.
* w3, w2 - skip w2, invoice w3 (0 - 80 [80 because w2 payment for w2 stuff [ignoring w1 invoice within w2] is 80]) = -80
* 
* // this correct cuz customer's w2 progression is 40 -> 150 -> 80 -> 0 -> 40.
* w3, w2 - upgrade w2 40, remove w3 prevInvoice (-40) and invoice w3 (40 - 40+40 [40 + 40 because original w2plan + w2's specific modificaiton invoices]) = 40
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

  async updateOrder(
    signedInUser: SignedInUser,
    orderId: string,
    updateOptions: IUpdateOrderInput,
    now = Date.now(),
    planService = getPlanService(),
  ): Promise<MutationBoolRes> {
    try {
      const validation = await validateUpdateOrder(updateOptions);
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
      const nextInvoice = await this.stripe.invoices.retrieveUpcoming({ customer: signedInUser.stripeCustomerId });
      const targetAdjustment = nextInvoice.lines.data.find(line => line.description && line.description.includes(targetOrderInvoiceDateDisplay))
      if (targetAdjustment) {
        try {
          await this.stripe.invoiceItems.del(targetAdjustment.id);
        } catch (e) {
          throw new Error (`Couldn't remove previous adjustment. ${e.stack}`)
        }
      }

      let originalPrice;
      // is the consumer updating an unpaid week?
      if (now < targetOrderInvoiceDate) {

        const upcomingPlan = nextInvoice.lines.data.find(line => !!line.plan);
        if (!upcomingPlan) throw new Error (`Could not find plan in invoice '${nextInvoice.id}' for consumer '${stripeCustomerId}'`);
        originalPrice = upcomingPlan.amount / 100;
      
      } else {

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
        const prevAdjustment = prevInvoice.lines.data.find(line => line.description && line.description.includes(targetOrderInvoiceDateDisplay))
        const prevPlan = prevInvoice.lines.data.find(line => !!line.plan)
        if (!prevPlan) throw new Error(`Couldn't get previous plan for consumer '${stripeCustomerId}' in invoice '${prevInvoice.id}'`);
        originalPrice = (prevPlan.amount + (prevAdjustment ? prevAdjustment.amount : 0)) / 100;
      
      }
      const newStripePlanId = updateOptions.stripePlanId;
      let amount;
      if (newStripePlanId) {
        const newPlan = await planService.getPlan(newStripePlanId);
        if (!newPlan) throw new Error(`Couldn't get plan from planId '${newStripePlanId}'`);
        amount = newPlan.weekPrice - originalPrice;
      } else {
        amount = 0;
      }

      if (amount !== 0) {
        await this.stripe.invoiceItems.create({
          customer: stripeCustomerId,
          amount,
          description: `Plan Adjustment for payment on ${targetOrderInvoiceDateDisplay}`,
          subscription: subscriptionId,
        });
      }
      return {
        res: true,
        error: null,
      }
    } catch (e) {
      console.error(`[OrderService] couldn't updateOrder for '${orderId}' with updateOptions '${updateOptions}'`, e.stack);
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
