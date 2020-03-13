import { IOrder, Order, IUpdateOrderInput } from './../../order/orderModel';
import { MutationBoolRes } from '../../utils/mutationResModel';
import { ICartInput } from '../../order/cartModel';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { ApolloError } from 'apollo-client';
import { useMemo } from 'react';
import { restFragment } from '../../rest/restFragment';

const MY_UPCOMING_ORDERS = gql`
  query myUpcomingOrders {
    myUpcomingOrders {
      _id
      deliveryDate
      destination {
        name
        address {
          address1
          address2
          city
          state
          zip
        }
        instructions
      }
      mealPrice
      meals {
        mealId
        img
        name
        quantity
      }
      phone
      rest {
        ...restFragment
      }
      status
    }
  }
  ${restFragment}
`

export const usePlaceOrder = (): [
  (cart: ICartInput) => void,
  {
    error?: ApolloError 
    data?: MutationBoolRes
  }
] => {
  type res = { placeOrder: MutationBoolRes };
  type vars = { cart: ICartInput }
  const [mutate, mutation] = useMutation<res,vars>(gql`
    mutation placeOrder($cart: CartInput!) {
      placeOrder(cart: $cart) {
        res
        error
      }
    }
  `);
  const placeOrder = (cart: ICartInput) => {
    mutate({ variables: { cart } })
  }
  return useMemo(() => [
    placeOrder,
    {
      error: mutation.error,
      data: mutation.data ? mutation.data.placeOrder : undefined,
    }
  ], [mutation]);
}

export const useUpdateOrder = (): [
  (orderId: string, updateOptions: IUpdateOrderInput) => void,
  {
    error?: ApolloError 
    data?: MutationBoolRes
  }
] => {
  type res = { updateOrder: MutationBoolRes };
  type vars = { orderId: string, updateOptions: IUpdateOrderInput }
  const [mutate, mutation] = useMutation<res,vars>(gql`
    mutation updateOrder($orderId: ID!, $updateOptions: UpdateOrderInput!) {
      updateOrder(orderId: $orderId, updateOptions: $updateOptions) {
        res
        error
      }
    }
  `);
  const updateOrder = (orderId: string, updateOptions: IUpdateOrderInput) => {
    mutate({ variables: {
      orderId,
      updateOptions
    }})
  }
  return useMemo(() => [
    updateOrder,
    {
      error: mutation.error,
      data: mutation.data ? mutation.data.updateOrder : undefined,
    }
  ], [mutation]);
}

export const useGetUpcomingOrders = () => {
  type res = { myUpcomingOrders: IOrder[] }
  const res = useQuery<res>(MY_UPCOMING_ORDERS);
  const orders = useMemo<Order[] | undefined>(() => (
    res.data ? res.data.myUpcomingOrders.map(order => new Order(order)) : res.data
  ), [res.data]);
  return {
    loading: res.loading,
    error: res.error,
    data: orders
  }
}