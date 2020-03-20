import { IRest } from './../../rest/restModel';
import { Cart } from './../../order/cartModel';
import { getAvailablePlans } from './../../plan/planService';
import { Plan } from './../../plan/planModel';
import { IOrder, Order, IUpdateOrderInput } from './../../order/orderModel';
import { MutationBoolRes } from "../../utils/apolloUtils";
import { ICartInput } from '../../order/cartModel';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { ApolloError } from 'apollo-client';
import { useMemo } from 'react';
import { restFragment } from '../../rest/restFragment';
import { getRest } from '../../rest/restService';
import { getMyConsumer, updateMyConsumer } from '../../consumer/consumerService';

const MY_UPCOMING_ORDERS_QUERY = gql`
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
    mutate({
      variables: { cart },
      update: (cache, { data }) => {
        if (data && data.placeOrder.res) {
          const consumer = getMyConsumer(cache);
          if (!consumer || !consumer.myConsumer) {
            const err = new Error('Failed to get myConsumer for cache update');
            console.error(err.stack);
            throw err;
          }
          updateMyConsumer(cache, {
            ...consumer.myConsumer,
            profile: {
              name: consumer.myConsumer.profile.name,
              email: consumer.myConsumer.profile.email,
              phone: cart.phone,
              card: cart.card,
              destination: {
                name: cart.destination.name,
                instructions: cart.destination.instructions,
                address: cart.destination.address,
              },
            },
            plan: cart.consumerPlan
          })
        }
      }
    })
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
    mutate({ 
      variables: {
        orderId,
        updateOptions
      },
      optimisticResponse: {
        updateOrder: {
          res: true,
          error: null,
          //@ts-ignore
          __typename: "BoolRes",
        }
      },
      update: (cache, { data }) => {
        if (data && data.updateOrder.res) {
          const upcomingOrders = cache.readQuery<upcomingOrdersRes>({ query: MY_UPCOMING_ORDERS_QUERY });
          if (!upcomingOrders) {
            const err = new Error('Couldn\'t get upcoming orders for cache update');
            console.error(err.stack);
            throw err;
          }
          let rest: IRest | null = null;
          if (updateOptions.restId) {
            const restRes = getRest(cache, updateOptions.restId)
            if (!restRes) {
              const err = new Error('Couldn\'t get rest for cache update');
              console.error(err.stack);
              throw err;
            }
            rest = restRes.rest;
          }
          let mealPrice: number | null = null;
          const mealCount = Cart.getMealCount(updateOptions.meals);
          if (mealCount > 0) {
            const plans = getAvailablePlans(cache);
            if (!plans) {
              const err = new Error('Couldn\'t get plan for cache update');
              console.error(err.stack);
              throw err;
            }
            mealPrice = Plan.getMealPriceFromCount(Cart.getMealCount(updateOptions.meals), plans.availablePlans);
          }
          const newUpcomingOrders = upcomingOrders.myUpcomingOrders.map(order => {
            if (order._id === orderId) {
              const newOrder = Order.getIOrderFromUpdatedOrderInput(
                orderId,
                updateOptions,
                mealPrice,
                mealCount > 0 ? order.status : 'Skipped',
                rest
              );
              //@ts-ignore
              newOrder.destination.address.__typename = 'Address';
              //@ts-ignore
              newOrder.destination.__typename = 'Destination';
              //@ts-ignore
              newOrder.meals.forEach(meal => meal.__typename = 'CartMeal');
              if (rest !== null) {
                //@ts-ignore
                newOrder.rest.location.address.__typename = 'Address';
                //@ts-ignore
                newOrder.rest.location.__typename = 'Location';
                //@ts-ignore
                newOrder.rest.menu.forEach(meal => meal.__typename = 'Meal')
                //@ts-ignore
                newOrder.rest.profile.__typename = 'Rest';
              }
              //@ts-ignore
              newOrder.__typename = 'Order';
              return newOrder;
            }
            return order;
          });
          cache.writeQuery({
            query: MY_UPCOMING_ORDERS_QUERY,
            data: {
              myUpcomingOrders: newUpcomingOrders,
            }
          })
        }
      }
    })
  }
  return useMemo(() => [
    updateOrder,
    {
      error: mutation.error,
      data: mutation.data ? mutation.data.updateOrder : undefined,
    }
  ], [mutation]);
}

type upcomingOrdersRes = { myUpcomingOrders: IOrder[] }
export const useGetUpcomingOrders = () => {
  const res = useQuery<upcomingOrdersRes>(MY_UPCOMING_ORDERS_QUERY);
  const orders = useMemo<Order[] | undefined>(() => (
    res.data ? res.data.myUpcomingOrders.map(order => new Order(order)) : res.data
  ), [res.data]);
  return {
    loading: res.loading,
    error: res.error,
    data: orders
  }
}