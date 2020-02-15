import { SignedInUser } from './../utils/models';
import { getConsumerService } from './../consumer/consumerService';
import { ICartInput } from './../../order/cartModel';
import { getGeoService } from './../place/geoService';
import { getRestService } from './../rests/restService';
import { getCannotBeEmptyError } from './../utils/error';
import { isDate2DaysLater } from './../../order/utils';
import { initElastic } from './../elasticConnector';
import { Client } from '@elastic/elasticsearch';
import { Order } from '../../order/orderModel';
import Stripe from 'stripe';
import { activeConfig } from '../../config';
import { Consumer } from '../../consumer/consumerModel';

const ORDER_INDEX = 'orders';

class OrderService {
  private readonly elastic: Client
  private readonly stripe: Stripe

  public constructor(elastic: Client, stripe: Stripe) {
    this.elastic = elastic;
    this.stripe = stripe;
  }

  async placeOrder(cart: ICartInput) {
    try {
      if (!cart.phone) {
        const msg = getCannotBeEmptyError('Phone number');
        console.warn('[OrderService]', msg);
        return {
          res: false,
          error: msg
        }
      }
      if (!Consumer.isDeliveryDayValid(cart.consumerPlan.deliveryDay)) {
        const msg = `Delivery day '${cart.consumerPlan.deliveryDay}' must be 0, 1, 2, 3, 4, 5, 6`;
        console.warn('[OrderService]', msg);
        return {
          res: false,
          error: msg
        }
      }
      if (!isDate2DaysLater(cart.deliveryDate)) {
        const msg = `Delivery date '${cart.deliveryDate}' is not 2 days in advance`;
        console.warn('[OrderService]', msg);
        return {
          res: false,
          error: msg,
        }
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

      try {
        const messages = await Promise.all([p1, p2]);
        if (messages[0]) {
          return {
            res: false,
            error: messages[0]
          }
        }
        if (messages[1]) {
          return {
            res: false,
            error: messages[1]
          }
        }
      } catch (e) {
        throw new Error(`Couldn't validate'${e.stack}'`);
      }

      const signedInUser: SignedInUser = {
        userId: '123',
        stripeSubscriptionId: 'sub_GjlPo5G3Q8Ty88',
        stripeCustomerId : "cus_GjlPTWyWniuNPa",
        profile: {
          name: 'name',
          email: 'email@email.com',
        },
      }

      const {
        deliveryDay,
        renewal,
        cuisines,
      } = cart.consumerPlan;

      let stripeCustomerId = signedInUser.stripeCustomerId;
      let stripeSubscriptionId = signedInUser.stripeSubscriptionId;
      let eConsumer = {
        plan: {
          stripePlanId: cart.consumerPlan.stripePlanId,
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

      let subUpdater: Promise<void | Stripe.Subscription> = Promise.resolve();
      if (stripeSubscriptionId && stripeCustomerId) {
        const subscription = await this.stripe.subscriptions.retrieve(stripeSubscriptionId);
        subUpdater = this.stripe.subscriptions.update(stripeSubscriptionId, {
          proration_behavior: 'none',
          items: [{
            id: subscription.items.data[0].id,
            plan: cart.consumerPlan.stripePlanId,
          }]
        });
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
          const subscription = await this.stripe.subscriptions.create({
            customer: stripeCustomerId,
            // fails on any id that isn't an active stripe plan
            items: [{ plan: cart.consumerPlan.stripePlanId }]
          });
          stripeSubscriptionId = subscription.id
        } catch (e) {
          // delete stripe customer to avoid zombie stripe customers
          await this.stripe.customers.del(stripeCustomerId);
          throw e;
        }
      }
      const order = Order.getNewOrderFromCartInput(signedInUser, cart, stripeSubscriptionId);
      const indexer = this.elastic.index({
        index: ORDER_INDEX,
        body: order
      })
      const consumerUpserter = getConsumerService().upsertConsumer(signedInUser.userId, {
        stripeCustomerId,
        stripeSubscriptionId,
        ...eConsumer
      });

      await Promise.all([subUpdater, consumerUpserter, indexer]);

      return {
        res: true,
        error: null
      };
    } catch (e) {
      console.error('[OrderService] could not place order', e.stack);
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
