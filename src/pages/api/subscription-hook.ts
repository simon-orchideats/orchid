import Stripe from 'stripe';
import { buffer } from 'micro'
import Cors from 'micro-cors'
import { activeConfig } from '../../config';
import { NextApiRequest, NextApiResponse } from 'next';

const stripe = new Stripe(activeConfig.server.stripe.key, {
  apiVersion: '2019-12-03',
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
  if (req.method === 'POST') {
    const buff = await buffer(req);
    const sig = req.headers['stripe-signature']!
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(buff.toString(), sig, 'whsec_zXIPgWgZs8Qk1pAmXjtA6I7PiSGiqER9')
    } catch (err) {
      console.error(`[SubscriptionHook] ${err.message}`)
      res.status(400).send(`Webhook Error: ${err.message}`)
      return
    }

    // Cast event data to Stripe object.
    if (event.type !== 'invoice.created') {
      console.warn(`[SubscriptionHook] Unhandled event type: ${event.type}`)
      res.json({ received: true });
      return;
    }
    console.log('got created', event.type);
    const invoice = event.data.object as Stripe.Invoice
    // console.log(`invoice ${JSON.stringify(invoice)}`)

    try {
      await stripe.invoiceItems.create({
        subscription: invoice.subscription as string,
        customer: invoice.customer as string,
        currency: 'usd',
        amount: 2500,
        discountable: false,
        invoice: invoice.id,
        description: 'sup',
      });
    } catch (e) {
      console.error('[SubscriptionHook] failed to create invoiceItem', e.stack)
    }
    res.json({ received: true })
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}

export default cors(handler as any)
