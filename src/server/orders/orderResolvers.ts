import { ICartInput } from '../../order/cartModel';
import { ServerResolovers } from '../utils/models';
import { getOrderService } from './orderService';

export const OrderMutationResolvers: ServerResolovers = {
  placeOrder: async (
    _root,
    { cart }: { cart: ICartInput },
  ) => {
    return await getOrderService().placeOrder(cart);
  }
}