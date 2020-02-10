import { isDateAfter2Days } from './../../order/utils';
import { ICartInput } from '../../order/cartModel';
import { initElastic, IndexResponse } from './../elasticConnector';
import { Client, ApiResponse } from '@elastic/elasticsearch';
import { Order } from '../../order/orderModel';

const ORDER_INDEX = 'orders';

export class OrderService {
  private readonly elastic: Client

  public constructor(elastic: Client) {
    this.elastic = elastic;
  }

  async placeOrder(cart: ICartInput) {
    if (isDateAfter2Days(cart.deliveryDate)) {
      const msg = `Delivery date '${cart.deliveryDate}' is not 2 days in advance`;
      console.error(`[OrderService] ${msg}`)
      throw new Error(msg);
    }

    const order = Order.getOrderFromCartInput(cart);
    try {
      const res: ApiResponse<IndexResponse> = await this.elastic.index({
        index: ORDER_INDEX,
        body: order
      });
      console.log(res.body);
      return order;
    } catch (e) {
      console.error(`[OrderService] could not place order. '${e.stack}'`);
      throw e;
    }
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
