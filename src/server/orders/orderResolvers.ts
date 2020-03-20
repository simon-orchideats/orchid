import { ICartInput } from '../../order/cartModel';
import { ServerResolovers } from '../../utils/apolloUtils';
import { getOrderService } from './orderService';
import { IUpdateOrderInput } from '../../order/orderModel';

export const OrderQueryResolvers: ServerResolovers = {
  myUpcomingOrders: async(_root, _args, { signedInUser }) => {
    return await getOrderService().getMyUpcomingOrders(signedInUser);
  }
}

export const OrderMutationResolvers: ServerResolovers = {
  placeOrder: async (
    _root,
    { cart }: { cart: ICartInput },
    { signedInUser },
  ) => {
    return await getOrderService().placeOrder(signedInUser, cart);
  },

  updateOrder: async (
    _root,
    { updateOptions, orderId }: { updateOptions: IUpdateOrderInput, orderId: string },
    { signedInUser },
  ) => {
    return await getOrderService().updateOrder(signedInUser, orderId, updateOptions);
  },
}