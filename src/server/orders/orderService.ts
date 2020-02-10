import { getNextDeliveryDate } from './../../order/utils';
import { ICartInput } from '../../order/cartModel';
import { initElastic } from './../elasticConnector';
import { Client } from 'elasticsearch';

const ORDER_INDEX = 'orders';

export class OrderService {
  private readonly elastic: Client

  public constructor(elastic: Client) {
    this.elastic = elastic;
  }

  placeOrder(cart: ICartInput) {
    console.log(this.elastic, ORDER_INDEX, cart);
    const expectedDeliveryDate = getNextDeliveryDate(cart.consumerPlan.deliveryDay).valueOf();
    if (cart.deliveryDate !== expectedDeliveryDate) {
      throw new Error(`Invalid delivery date '${cart.deliveryDate}', exepected ${expectedDeliveryDate}`)
    }
    return true;
  }

}

let orderService: OrderService;

export const initOrderService = (elastic: Client) => {
  if (orderService) throw new Error('[OrderService] already initialized.');
  orderService = new OrderService(elastic);
};

export const getOrderService = () => {
  if (orderService) return orderService;
  initOrderService(initElastic());
  return orderService;
}
