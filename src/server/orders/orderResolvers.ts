import { ICartInput } from '../../order/cartModel';
import { ServerResolovers } from '../../utils/apolloUtils';
import { getOrderService } from './orderService';
import { IUpdateDeliveryInput } from '../../order/deliveryModel';

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
  
  myRewards: async(_root, _args, { signedInUser }) => {
    try {
      return await getOrderService().getMyRewards(signedInUser);
    } catch (e) {
      console.error(`[OrderResolver] Failed to get getMyRewards '${signedInUser?._id}'`, e.stack);
      throw new Error('Internal Server Error');
    }
  },

  mySpent: async(_root, _args, { signedInUser }) => {
    try {
      return await getOrderService().getMySpent(signedInUser);
    } catch (e) {
      console.error(`[OrderResolver] Failed to get getMySpent '${signedInUser?._id}'`, e.stack);
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
  getPromo: async (
    _root,
    {
      promoCode,
      phone,
      fullAddr
    }: {
      promoCode: string
      phone: string
      fullAddr: string
    },
  ) => {
    try {
      return await getOrderService().getPromo(promoCode, phone, fullAddr);
    } catch (e) {
      throw new Error('Internal Server Error');
    }
  },

  placeOrder: async (
    _root,
    { cart }: { cart: ICartInput },
    { signedInUser, req, res },
  ) => {
    return await getOrderService().placeOrder(signedInUser, cart, req, res);
  },

  updateDeliveries: async (
    _root,
    { updateOptions, orderId }: { updateOptions: IUpdateDeliveryInput, orderId: string },
    { signedInUser },
  ) => {
    return await getOrderService().updateDeliveries(signedInUser, orderId, updateOptions);
  },

  skipDelivery: async (
    _root,
    { deliveryIndex, orderId }: { deliveryIndex: number, orderId: string },
    { signedInUser },
  ) => {
    return await getOrderService().skipDelivery(signedInUser, orderId, deliveryIndex);
  },

  removeDonations: async (
    _root,
    { orderId }: { orderId: string },
    { signedInUser },
  ) => {
    return await getOrderService().removeDonations(signedInUser, orderId);
  },
}