import moment from 'moment';
import { getOrderService } from './../../server/orders/orderService';
import { getConsumerService } from './../../server/consumer/consumerService';
import Stripe from 'stripe';
import { buffer } from 'micro'
import Cors from 'micro-cors'
import { activeConfig } from '../../config';
import { NextApiRequest, NextApiResponse } from 'next';

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

/**
 * test this via creating a subscription with a now trial period
 curl https://api.stripe.com/v1/subscriptions -u sk_test_EtoOx29Q3dzaLnbQSg3ByORG00k8y4TX9j   -d customer=cus_GxVSVDNqZWXoxY -d "items[0][plan]"=plan_GiaBhGMrdjKDFU -d "trial_end"=now
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const buff = await buffer(req);
    const sig = req.headers['stripe-signature']!
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(buff.toString(), sig, activeConfig.server.stripe.hookSecret)
    } catch (err) {
      console.error(`[SubscriptionHook] ${err.stack}`)
      res.status(400).send(`Webhook Error: ${err.message}`)
      return
    }

    // Use invoice upcoming instead of invoice created because when a consumer cancels that creates an invoice
    // and we dont wanna create an automatically generated order for someone who is cancelling
    if (event.type !== 'invoice.upcoming') {
      console.warn(`[SubscriptionHook] Unhandled event type: ${event.type}`)
      res.json({ received: true });
      return;
    }

    const invoice = event.data.object as Stripe.Invoice
    try {
      const stripeCustomerId = invoice.customer as string;
      const consumer = await getConsumerService().getConsumerByStripeId(stripeCustomerId);
      if (!consumer) throw new Error (`Consumer not found with stripeCustomerId ${stripeCustomerId}`)
      if (!consumer.plan) throw new Error(`Received invoice creation for consumer ${stripeCustomerId} without a plan`);

      const planInvoiceLineItem = invoice.lines.data.find(p => !!p.plan);
      if (!planInvoiceLineItem || !planInvoiceLineItem.plan) {
        throw new Error(`Plan not found in subscription for stripe customerId '${stripeCustomerId}'`);
      }
      if (!planInvoiceLineItem.plan.amount) {
        throw new Error(`Plan invoice line item has no amount for stirpeCustomerId '${stripeCustomerId}' and line ${planInvoiceLineItem.id}`);
      }
      const {
        mealCount,
        mealPrice,
      } = planInvoiceLineItem.plan.metadata;
      await getOrderService().addAutomaticOrder(
        consumer,
        // 2 weeks because 1 week would be nextnext order
        moment().add(2, 'w').valueOf(),
        parseFloat(mealCount),
        planInvoiceLineItem.plan.amount / 100,
        parseFloat(mealPrice)
      );
    } catch (e) {
      console.error('[SubscriptionHook] failed to generate automatic order', e.stack);
      throw e;
    } finally {
      res.json({ received: true })
    }
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}

export default cors(handler as any)
