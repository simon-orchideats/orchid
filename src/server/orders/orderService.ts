import { ICartInput } from './../../cart/cartModel';
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
