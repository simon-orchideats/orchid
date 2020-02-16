import { SignedInUser } from './../utils/models';
import { ICartInput } from '../../order/cartModel';
import { ServerResolovers } from '../utils/models';
import { getOrderService } from './orderService';

const signedInUser: SignedInUser = {
  userId: '123',
  stripeSubscriptionId: 'sub_GjlPo5G3Q8Ty88',
  stripeCustomerId : "cus_GjlPTWyWniuNPa",
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
}