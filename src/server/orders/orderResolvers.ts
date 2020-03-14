import { SignedInUser } from './../utils/models';
import { ICartInput } from '../../order/cartModel';
import { ServerResolovers } from '../utils/models';
import { getOrderService } from './orderService';
import { IUpdateOrderInput } from '../../order/orderModel';

const signedInUser: SignedInUser = {
  _id: '123',
  stripeSubscriptionId: 'sub_Gu8thU86pieDAB',
  stripeCustomerId : "cus_Gu8tefqciK74mK",
  profile: {
    name: 'name',
    email: 'email@email.com',
  },
}

export const OrderQueryResolvers: ServerResolovers = {
  myUpcomingOrders: async() => {
    return await getOrderService().getMyUpcomingOrders(signedInUser);
  }
}

export const OrderMutationResolvers: ServerResolovers = {
  placeOrder: async (
    _root,
    { cart }: { cart: ICartInput },
  ) => {
    return await getOrderService().placeOrder(signedInUser, cart);
  },

  updateOrder: async (
    _root,
    { updateOptions, orderId }: { updateOptions: IUpdateOrderInput, orderId: string },
  ) => {
    return await getOrderService().updateOrder(signedInUser, orderId, updateOptions);
  },
}