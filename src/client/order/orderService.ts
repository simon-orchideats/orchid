import { Consumer } from './../../consumer/consumerModel';
import { consumerFragment } from './../../consumer/consumerFragment';
import { IOrder, Order } from './../../order/orderModel';
import { MutationConsumerRes } from "../../utils/apolloUtils";
import { ICartInput } from '../../order/cartModel';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { ApolloError } from 'apollo-client';
import { useMemo } from 'react';
import { updateMyConsumer, copyWithTypenames } from '../../consumer/consumerService';
import { orderFragment } from '../../order/orderFragment';

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
    console.log(copyWithTypenames, newConsumer);
    mutate({
      variables: { cart },
      // optimisticResponse: {
      //   placeOrder: {
      //     res: copyWithTypenames({
      //       _id: newConsumer._id,
      //       stripeCustomerId: null,
      //       profile: {
      //         name: newConsumer.name,
      //         email: newConsumer.email,
      //         phone: cart.phone,
      //         card: cart.card,
      //         searchArea: {
      //           primaryAddr: cart.searchArea,
      //           address2: null, // null to be replaced when it repopulates later
      //           geo: {
      //             // empty string with the intention that it populates later
      //             lat: '',
      //             lon: '',
      //           }
      //         },
      //         serviceInstructions: cart.cartOrder.serviceInstructions,
      //       },
      //       plan: null,
      //       permissions: [] // empty so it populates later
      //     }),
      //     error: null,
      //     //@ts-ignore
      //     __typename: 'ConsumerRes'
      //   }
      // },
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
