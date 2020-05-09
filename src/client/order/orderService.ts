import { Plan } from './../../plan/planModel';
import { Consumer } from './../../consumer/consumerModel';
import { consumerFragment } from './../../consumer/consumerFragment';
import { IOrder, Order, MealPrice } from './../../order/orderModel';
import { IUpdateDeliveryInput, Delivery } from './../../order/deliveryModel';
import { MutationBoolRes, MutationConsumerRes } from "../../utils/apolloUtils";
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

export const useGetOrder = (orderId: string | null) => {
  type res = { order: IOrder }
  const res = useQuery<res>(
    gql`
      query order($orderId: ID!) {
        order(orderId: $orderId) {
          ...orderFragment
        }
      }
      ${orderFragment}
    `, 
    {
      skip: !orderId,
      variables: { orderId },
    }
  );
  return {
    loading: res.loading,
    error: res.error,
    data: res.data ? new Order(res.data.order) : res.data
  }
}


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
              destination: {
                instructions: cart.destination.instructions,
                address: cart.destination.address,
              },
            },
            plan: cart.consumerPlan
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
      res: mutation.data.placeOrder.res && new Consumer(mutation.data.placeOrder.res),
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

export const useSkipDelivery = (): [
  (order: Order, deliveryIndex: number, plans: Plan[]) => void,
  {
    error?: ApolloError 
    data?: MutationBoolRes
  }
] => {
  type res = { skipDelivery: MutationBoolRes };
  type vars = { orderId: string, deliveryIndex: number }
  const [mutate, mutation] = useMutation<res,vars>(gql`
    mutation skipDelivery($orderId: ID!, $deliveryIndex: Int!) {
      skipDelivery(orderId: $orderId, deliveryIndex: $deliveryIndex) {
        res
        error
      }
    }
  `);
  const skipDelivery = (order: Order, deliveryIndex: number, plans: Plan[]) => {
    mutate({ 
      variables: {
        orderId: order.Id,
        deliveryIndex
      },
      optimisticResponse: {
        skipDelivery: {
          res: true,
          error: null,
          //@ts-ignore
          __typename: "BoolRes",
        }
      },
      update: (cache, { data }) => {
        if (!data || !data.skipDelivery.res) return;
        const upcomingOrders = cache.readQuery<upcomingOrdersRes>({ query: MY_UPCOMING_ORDERS_QUERY });
        if (!upcomingOrders) {
          const err = new Error('Failed to get upcoming orders for cache update');
          console.error(err.stack);
          throw err;
        }
        const newDeliveries = order.Deliveries.map((d, i) => 
          i === deliveryIndex ? 
            new Delivery({
              ...d,
              meals: [],
              status: 'Skipped',
            })
          :
            new Delivery(d)
        );
        const mealPrices = MealPrice.getMealPriceFromDeliveries(
          plans,
          newDeliveries,
          order.DonationCount,
        )
        const newUpcomingOrders = upcomingOrders.myUpcomingOrders.map(upcomingOrder => {
          if (order._id !== upcomingOrder._id) return upcomingOrder;
          const copy = Order.getICopy(upcomingOrder);
          const newOrder: IOrder = {
            ...copy,
            costs: {
              ...copy.costs,
              mealPrices,
            },
            deliveries: newDeliveries,
          }
          return Order.addTypenames(newOrder);
        });
        cache.writeQuery({
          query: MY_UPCOMING_ORDERS_QUERY,
          data: {
            myUpcomingOrders: newUpcomingOrders,
          }
        })
      }
    })
  }
  return useMemo(() => [
    skipDelivery,
    {
      error: mutation.error,
      data: mutation.data ? mutation.data.skipDelivery : undefined,
    }
  ], [mutation]);
}

export const useUpdateDeliveries = (): [
  (orderId: string, updateOptions: IUpdateDeliveryInput) => void,
  {
    error?: ApolloError 
    data?: MutationBoolRes
  }
] => {
  type res = { updateDeliveries: MutationBoolRes };
  type vars = { orderId: string, updateOptions: IUpdateDeliveryInput }
  const [mutate, mutation] = useMutation<res,vars>(gql`
    mutation updateDeliveries($orderId: ID!, $updateOptions: UpdateDeliveryInput!) {
      updateDeliveries(orderId: $orderId, updateOptions: $updateOptions) {
        res
        error
      }
    }
  `);
  const updateDeliveries = (orderId: string, updateOptions: IUpdateDeliveryInput) => {
    mutate({ 
      variables: {
        orderId,
        updateOptions
      },
      optimisticResponse: {
        updateDeliveries: {
          res: true,
          error: null,
          //@ts-ignore
          __typename: "BoolRes",
        }
      },
    })
  }
  return useMemo(() => [
    updateDeliveries,
    {
      error: mutation.error,
      data: mutation.data ? mutation.data.updateDeliveries : undefined,
    }
  ], [mutation]);
}

export const useRemoveDonations = (): [
  (order: Order, plans: Plan[]) => void,
  {
    error?: ApolloError 
    data?: MutationBoolRes
  }
] => {
  type res = { removeDonations: MutationBoolRes };
  type vars = { orderId: string }
  const [mutate, mutation] = useMutation<res,vars>(gql`
    mutation removeDonations($orderId: ID!) {
      removeDonations(orderId: $orderId) {
        res
        error
      }
    }
  `);
  const removeDonations = (order: Order, plans: Plan[]) => {
    mutate({ 
      variables: {
        orderId: order.Id,
      },
      optimisticResponse: {
        removeDonations: {
          res: true,
          error: null,
          //@ts-ignore
          __typename: "BoolRes",
        }
      },
      update: (cache, { data }) => {
        if (!data || !data.removeDonations.res) return;
        const upcomingOrders = cache.readQuery<upcomingOrdersRes>({ query: MY_UPCOMING_ORDERS_QUERY });
        if (!upcomingOrders) {
          const err = new Error('Failed to get upcoming orders for cache update');
          console.error(err.stack);
          throw err;
        }
        const mealPrices = MealPrice.getMealPriceFromDeliveries(
          plans,
          order.Deliveries,
          0,
        )
        const newUpcomingOrders = upcomingOrders.myUpcomingOrders.map(upcomingOrder => {
          if (order._id !== upcomingOrder._id) return upcomingOrder;
          
          const copy = Order.getICopy(upcomingOrder);
          const newOrder: IOrder = {
            ...copy,
            costs: {
              ...copy.costs,
              mealPrices,
            },
            donationCount: 0,
          }
          return Order.addTypenames(newOrder);
        });
        cache.writeQuery({
          query: MY_UPCOMING_ORDERS_QUERY,
          data: {
            myUpcomingOrders: newUpcomingOrders,
          }
        })
      }
    })
  }
  return useMemo(() => [
    removeDonations,
    {
      error: mutation.error,
      data: mutation.data ? mutation.data.removeDonations : undefined,
    }
  ], [mutation]);
}

type upcomingOrdersRes = { myUpcomingOrders: IOrder[] }
export const useGetUpcomingOrders = () => {
  const res = useQuery<upcomingOrdersRes>(MY_UPCOMING_ORDERS_QUERY, { fetchPolicy: 'cache-and-network' });
  const orders = useMemo<Order[] | undefined>(() => (
    res.data ? res.data.myUpcomingOrders.map(order => new Order(order)) : res.data
  ), [res.data]);
  return {
    loading: res.loading,
    error: res.error,
    data: orders
  }
}