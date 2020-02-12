import { getRestService } from './../rests/restService';
import { getCannotBeEmptyError } from './../utils/error';
import { isDate2DaysLater } from './../../order/utils';
import { ICartInput } from '../../order/cartModel';
import { initElastic, IndexResponse } from './../elasticConnector';
import { Client, ApiResponse } from '@elastic/elasticsearch';
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
      // left off here. check destination, meals is valid
      if (!cart.phone) {
        throw new Error(getCannotBeEmptyError(`Phone number`));
      }
      if (!Consumer.isDeliveryDayValid(cart.consumerPlan.deliveryDay)) {
        throw new Error(`Delivery day '${cart.consumerPlan.deliveryDay}' must be 0, 1, 2, 3, 4, 5, 6`);
      }
      if (!isDate2DaysLater(cart.deliveryDate)) {
        throw new Error(`Delivery date '${cart.deliveryDate}' is not 2 days in advance`);
      }
      const rest = await getRestService().getRest(cart.restId, ['menu']);
      if (!rest) {
        throw new Error(`Can't find rest '${cart.restId}'`);
      }
      for (let i = 0; i < cart.meals.length; i++) {
        if (!rest.menu.find(meal => meal._id === cart.meals[i].mealId)) {
          throw new Error(`Can't find mealId '${cart.meals[i].mealId}'`);
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
        const res: ApiResponse<IndexResponse> = await this.elastic.index({
          index: ORDER_INDEX,
          body: order
        });
        console.log(res.body);
        return true;
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
