import { ICartInput } from '../../order/cartModel';
import { ServerResolovers } from '../../utils/apolloUtils';
import { getOrderService } from './orderService';

export const OrderQueryResolvers: ServerResolovers = {
  allUpcomingOrders: async(_root, _args, { signedInUser }) => {
    try {
      return await getOrderService().getAllUpcomingIOrders(signedInUser);
    } catch (e) {
      console.error(`[OrderResolver] Failed to get allUpcomingOrders '${signedInUser?._id}'`, e.stack);
      throw new Error('Internal Server Error');
    }
  },

  
  allPaidOrders: async(_root, _args, { signedInUser }) => {
    try {
      return await getOrderService().getAllPaidIOrders(signedInUser);
    } catch (e) {
      console.error(`[OrderResolver] Failed to get allPaidOrders '${signedInUser?._id}'`, e.stack);
      throw new Error('Internal Server Error');
    }
  },

  myUpcomingOrders: async(_root, _args, { signedInUser }) => {
    return await getOrderService().getMyUpcomingIOrders(signedInUser);
  },

  myPaidOrders: async(_root, _args, { signedInUser }) => {
    try {
      return await getOrderService().getMyPaidOrders(signedInUser);
    } catch (e) {
      console.error(`[OrderResolver] Failed to get myPaidOrders for '${signedInUser?._id}'`)
      throw new Error('Internal Server Error');
    }
  },

  order: async(_root, { orderId }: { orderId: string }, { signedInUser }) => {
    return await getOrderService().getIOrder(signedInUser, orderId);
  }
}

export const OrderMutationResolvers: ServerResolovers = {
  placeOrder: async (
    _root,
    { cart }: { cart: ICartInput },
    { signedInUser, req, res },
  ) => {
    try {
      return await getOrderService().placeOrder(signedInUser, cart, req, res);
    } catch (e) {
      console.error(`[OrderService] could not place order for '${signedInUser?._id}'`, e.stack);
      throw new Error('Internal Server Error');
    }
  },
}