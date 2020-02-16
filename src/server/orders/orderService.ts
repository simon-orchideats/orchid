import { getGeoService } from './../place/geoService';
import { getRestService } from './../rests/restService';
import { getCannotBeEmptyError } from './../utils/error';
import { isDate2DaysLater } from './../../order/utils';
import { ICartInput } from '../../order/cartModel';
import { initElastic } from './../elasticConnector';
import { Client } from '@elastic/elasticsearch';
import { Order } from '../../order/orderModel';
import Stripe from 'stripe';
import { activeConfig } from '../../config';
import { Consumer } from '../../consumer/consumerModel';

const ORDER_INDEX = 'orders';

export class OrderService {
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
      const rest = await getRestService().getRest(cart.restId, ['menu']);
      if (!rest) {
        const msg = `Can't find rest '${cart.restId}'`
        console.warn('[OrderService]', msg);
        return {
          res: false,
          error: msg
        }
      }
      for (let i = 0; i < cart.meals.length; i++) {
        if (!rest.menu.find(meal => meal._id === cart.meals[i].mealId)) {
          const msg = `Can't find mealId '${cart.meals[i].mealId}'`
          console.warn('[OrderService]', msg);
          return {
            res: false,
            error: msg
          }
        }
      }
      const {
        address1,
        city,
        state,
        zip,
      } = cart.destination.address;
      try {
        await getGeoService().getGeocode(address1, city, state, zip);
      } catch (e) {
        const msg = `Couldn't verify address '${address1} ${city} ${state}, ${zip}'`
        console.warn('[OrderService]', msg);
        return {
          res: false,
          error: msg,
        }
      }
      // todo: check if stripe customer exists first, if not then do this otherwise skip
      const signedInUser = {
        userId: '123',
        name: 'name',
        email: 'email@email.com',
      }

      let stripeCustomer;
      try {
        stripeCustomer = await this.stripe.customers.create({
          payment_method: cart.paymentMethodId,
          email: signedInUser.email,
          invoice_settings: {
            default_payment_method: cart.paymentMethodId,
          },
        });
      } catch (e) {
        throw new Error(`Couldn't create customer '${e.stack}'`);
      }
  
      let subscription;
      try {
        subscription = await this.stripe.subscriptions.create({
          customer: stripeCustomer.id,
          // fails on any id that isn't an active stripe plan
          items: [{ plan: cart.consumerPlan.stripePlanId }]
        });
      } catch (e) {
        throw new Error(`Couldn't create subscription '${e.stack}'`);
      }
  
      const order = Order.getNewOrderFromCartInput(signedInUser, cart, subscription.id,);

      try {
        await this.elastic.index({
          index: ORDER_INDEX,
          body: order
        });
        return {
          res: true,
          error: null
        };
      } catch (e) {
        throw new Error(`Couldn't index order '${e.stack}'`);
      }
    } catch (e) {
      console.error('[OrderService] could not place order', e.stack);
      throw e;
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
