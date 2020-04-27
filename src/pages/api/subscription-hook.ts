import { getPlanService } from './../../server/plans/planService';
import moment from 'moment';
import { getOrderService } from './../../server/orders/orderService';
import { getConsumerService } from './../../server/consumer/consumerService';
import Stripe from 'stripe';
import { buffer } from 'micro'
import Cors from 'micro-cors'
import { activeConfig } from '../../config';
import { NextApiRequest, NextApiResponse } from 'next';
import { MealPrice } from '../../order/orderModel';
import { Delivery } from '../../order/deliveryModel';

const stripe = new Stripe(activeConfig.server.stripe.key, {
  apiVersion: '2020-03-02',
});

export const config = {
  api: {
    bodyParser: false,
  },
}

const cors = Cors({
  allowMethods: ['POST', 'HEAD'],
})

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed');
    return;
  }
  const buff = await buffer(req);
  const sig = req.headers['stripe-signature']!
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(buff.toString(), sig, 'whsec_biiH85jKtOenz8t5CsMsUBUD9NJXItCM')
  } catch (err) {
    console.error(`[SubscriptionHook] ${err.stack}`)
    res.status(400).send(`Webhook Error: ${err.message}`)
    return
  }

  if (event.type !== 'invoice.upcoming' && event.type !== 'invoice.created') {
    console.warn(`[SubscriptionHook] Unhandled event type: ${event.type}`)
    res.json({ received: true });
    return;
  }

  res.json({ received: true });
  const invoice = event.data.object as Stripe.Invoice
  const stripeCustomerId = invoice.customer as string;
  const consumer = await getConsumerService().getConsumerByStripeId(stripeCustomerId);
  if (!consumer) throw new Error (`Consumer not found with stripeCustomerId ${stripeCustomerId}`)
  
  // happens when subscription is canceled
  if (!consumer.plan) return;
  if (consumer.plan && consumer.plan.mealPlans.length === 0) {
    throw new Error(`Received invoice creation for consumer ${stripeCustomerId} with no meal plans`)
  };

  const mealPlans = consumer.plan.mealPlans;

  if (event.type === 'invoice.upcoming') {
    try {
      const plans = await getPlanService().getAvailablePlans();
      const mealPrices = MealPrice.getMealPrices(mealPlans, plans);
      await getOrderService().addAutomaticOrder(
        // 2 weeks because 1 week would be nextnext order
        2,
        consumer,
        // 3 weeks because 2 week would be nextnext order
        moment().add(3, 'w').valueOf(),
        mealPrices,
      );
    } catch (e) {
      console.error('[SubscriptionHook] failed to generate automatic order', e.stack);
      throw e;
    }
  } else {
    try {
      if (invoice.billing_reason === 'subscription_create') return;
      const planInvoiceLineItems: Stripe.InvoiceLineItem[] = [];
      for (let i = 0; i < mealPlans.length; i++) {
        const planInvoiceLineItem = invoice.lines.data.find(li => {
          if (!li.plan || !consumer || !consumer.plan) return false;
          return li.plan.id === mealPlans[i].stripePlanId
        });
        if (!planInvoiceLineItem) {
          throw new Error(`Plan ${mealPlans[i].stripePlanId} not found for stripe customerId '${stripeCustomerId}'`);
        }
        planInvoiceLineItems.push(planInvoiceLineItem);
      }
      const todaysOrder = await getOrderService().confirmCurrentOrderDeliveries(consumer._id);
      const numConfirmedMeals = Delivery.getConfirmedMealCount(todaysOrder.deliveries);
      planInvoiceLineItems.forEach(li => {
        // if it's not a subscription line item, do nothing
        if (!li.subscription_item || !li.plan) return
        const timestamp = li.period.end - 60;
        getOrderService().setOrderUsage(
          li.subscription_item,
          numConfirmedMeals[li.plan.id],
          timestamp
        );
      })
    } catch (e) {
      console.error('[SubscriptionHook] failed to confirm deliveries for order', e.stack);
      throw e;
    }
  }
}

export default cors(handler as any)
