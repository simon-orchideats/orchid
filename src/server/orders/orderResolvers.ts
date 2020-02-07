import { ICartInput } from './../../cart/cartModel';
import { ServerResolovers } from './../schema/utilModels';
import { getOrderService } from './orderService';

export const OrderMutationResolvers: ServerResolovers = {
  placeOrder: async (
    _root,
    { cart }: { cart: ICartInput },
  ) => {
    return await getOrderService().placeOrder(cart);
  }
}