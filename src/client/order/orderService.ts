//@ts-nocheck

import { IRewards, Rewards } from './../../order/rewardModel';
import { MutationPromoRes, Promo } from './../../order/promoModel';
import { Plan, IPlan } from './../../plan/planModel';
import { Consumer } from './../../consumer/consumerModel';
import { consumerFragment } from './../../consumer/consumerFragment';
import { IOrder, Order, MealPrice } from './../../order/orderModel';
import { MutationBoolRes, MutationConsumerRes } from "../../utils/apolloUtils";
import { ICartInput } from '../../order/cartModel';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { ApolloError } from 'apollo-client';
import { useMemo } from 'react';
import { updateMyConsumer, copyWithTypenames } from '../../consumer/consumerService';
import { orderFragment } from '../../order/orderFragment';
import { ISpent, Spent } from '../../order/costModel';

const MY_UPCOMING_ORDERS_QUERY = gql`
  query myUpcomingOrders {
    myUpcomingOrders {
      ...orderFragment
    }
  }
  ${orderFragment}
`

const ALL_UPCOMING_ORDERS_QUERY = gql`
  query allUpcomingOrders {
    allUpcomingOrders {
      ...orderFragment
    }
  }
  ${orderFragment}
`

type newConsumer = {
  _id: string,
  name: string,
  email: string
};
export const usePlaceOrder = (): [
  (newConsumer: newConsumer, cart: ICartInput) => void,
  {
    error?: ApolloError 
    data?: {
      res: Consumer | null,
      error: string | null
    },
    called: boolean,
  }
] => {
  type res = { placeOrder: MutationConsumerRes };
  type vars = { cart: ICartInput }
  const [mutate, mutation] = useMutation<res,vars>(gql`
    mutation placeOrder($cart: CartInput!) {
      placeOrder(cart: $cart) {
        res {
          ...consumerFragment
        }
        error
      }
    }
    ${consumerFragment}
  `);
  const placeOrder = (newConsumer: newConsumer, cart: ICartInput) => {
    mutate({
      variables: { cart },
      optimisticResponse: {
        placeOrder: {
          res: copyWithTypenames({
            _id: newConsumer._id,
            stripeSubscriptionId: null,
            stripeCustomerId: null,
            profile: {
              name: newConsumer.name,
              email: newConsumer.email,
              phone: cart.phone,
              card: cart.card,
              location: {
                instructions: cart.location.instructions,
                address: cart.location.address,
              },
            },
            plan: {
              ...cart.consumerPlan,
              referralCode: '', // empty string with the intention that it populates later
              weeklyDiscounts: [] // empty so it populates later
            },
            permissions: [] // empty so it populates later
          }),
          error: null,
          //@ts-ignore
          __typename: 'ConsumerRes'
        }
      },
      update: (cache, { data }) => {
        if (data && data.placeOrder.res) updateMyConsumer(cache, data.placeOrder.res)
      },
      // refetchQueries: () => [{ query: MY_UPCOMING_ORDERS_QUERY }],
    })
  }
  return useMemo(() => {
    const data = mutation.data && {
      res: mutation.data.placeOrder.res && Consumer.getICopy(mutation.data.placeOrder.res),
      error: mutation.data.placeOrder.error
    }
    return [
      placeOrder,
      {
        error: mutation.error,
        data,
        called: mutation.called
      }
    ]
  }, [mutation]);
}

type myUpcomingOrdersRes = { myUpcomingOrders: IOrder[] }
export const useGetMyUpcomingOrders = () => {
  const res = useQuery<myUpcomingOrdersRes>(MY_UPCOMING_ORDERS_QUERY);
  const orders = useMemo<IOrder[] | undefined>(() => (
    res.data ? res.data.myUpcomingOrders.map(order => Order.getICopy(order)) : res.data
  ), [res.data]);
  return {
    loading: res.loading,
    error: res.error,
    data: orders
  }
}

export const useGetMyPaidOrders = () => {
  const res = useQuery<{ myPaidOrders: IOrder[] }>(gql`
    query myPaidOrders {
      myPaidOrders {
          ...orderFragment
        }
      }
      ${orderFragment}
    `
  );
  const orders = useMemo<IOrder[] | undefined>(() => (
    res.data ? res.data.myPaidOrders.map(order => Order.getICopy(order)) : res.data
  ), [res.data]);
  return {
    loading: res.loading,
    error: res.error,
    data: orders
  }
}

type allUpcomingOrdersRes = { allUpcomingOrders: IOrder[] }
export const useGetAllUpcomingOrders = () => {
  const res = useQuery<allUpcomingOrdersRes>(ALL_UPCOMING_ORDERS_QUERY);
  const orders = useMemo<IOrder[] | undefined>(() => (
    res.data ? res.data.allUpcomingOrders.map(order => Order.getICopy(order)) : res.data
  ), [res.data]);
  return {
    loading: res.loading,
    error: res.error,
    data: orders
  }
}

export const useGetAllPaidOrders = () => {
  const res = useQuery<{ allPaidOrders: IOrder[] }>(gql`
    query allPaidOrders {
      allPaidOrders {
          ...orderFragment
        }
      }
      ${orderFragment}
    `
  );
  const orders = useMemo<IOrder[] | undefined>(() => (
    res.data ? res.data.allPaidOrders.map(order => Order.getICopy(order)) : res.data
  ), [res.data]);
  return {
    loading: res.loading,
    error: res.error,
    data: orders
  }
}