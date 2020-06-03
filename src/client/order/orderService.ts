import { MutationPromoRes, Promo } from './../../order/promoModel';
import { Plan, IPlan } from './../../plan/planModel';
import { Consumer } from './../../consumer/consumerModel';
import { consumerFragment } from './../../consumer/consumerFragment';
import { IOrder, Order, MealPrice } from './../../order/orderModel';
import { IUpdateDeliveryInput, Delivery, DeliveryInput, DeliveryStatuses } from './../../order/deliveryModel';
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

const ALL_UPCOMING_ORDERS_QUERY = gql`
  query allUpcomingOrders {
    allUpcomingOrders {
      ...orderFragment
    }
  }
  ${orderFragment}
`

export const useGetPromo = (): [
  (promoCode: string, phone: string, fullAddr: string) => void,
  {
    error?: ApolloError 
    data?: {
      res: Promo | null,
      error: string | null
    },
  }
] => {
  type res = { getPromo: MutationPromoRes };
  type vars = { promoCode: string, phone: string, fullAddr: string }
  const [mutate, mutation] = useMutation<res,vars>(gql`
    mutation getPromo($promoCode: String!, $phone: String!, $fullAddr: String!) {
      getPromo(promoCode: $promoCode, phone: $phone, fullAddr: $fullAddr) {
        res {
          stripeCouponId
          percentOff
          amountOff
          duration
        }
        error
      }
    }
  `);
  const getPromo = (promoCode: string, phone: string, fullAddr: string) => {
    mutate({
      variables: { promoCode, phone, fullAddr },
    })
  }
  return useMemo(() => {
    const data = mutation.data && {
      res: mutation.data.getPromo.res && new Promo(mutation.data.getPromo.res),
      error: mutation.data.getPromo.error
    }
    return [
      getPromo,
      {
        error: mutation.error,
        data,
      }
    ]
  }, [mutation]);
}


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
        const upcomingOrders = cache.readQuery<myUpcomingOrdersRes>({ query: MY_UPCOMING_ORDERS_QUERY });
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
            isAutoGenerated: false,
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
  (orderId: string, updateOptions: IUpdateDeliveryInput, plans: IPlan[]) => void,
  {
    error?: ApolloError 
    data?: MutationBoolRes
  },
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
  const updateDeliveries = (orderId: string, updateOptions: IUpdateDeliveryInput, plans: IPlan[]) => {
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
      update: (cache, { data }) => {
        if (!data || !data.updateDeliveries.res) return;
        const upcomingOrders = cache.readQuery<myUpcomingOrdersRes>({ query: MY_UPCOMING_ORDERS_QUERY });
        if (!upcomingOrders) {
          const err = new Error('Failed to get upcoming orders for cache update');
          console.error(err.stack);
          throw err;
        }
        const newUpcomingOrders = upcomingOrders.myUpcomingOrders.map(upcomingOrder => {
          if (orderId !== upcomingOrder._id) return upcomingOrder;
          const copy = Order.getICopy(upcomingOrder);
          const oldConfirmedDeliveries = upcomingOrder.deliveries
            .filter(d => d.status === 'Confirmed')
            .map(d => Delivery.getICopy(d));
          const newDeliveries = [
            ...oldConfirmedDeliveries,
            ...updateOptions.deliveries.map(d => ({
              ...DeliveryInput.getICopy(d),
              status: DeliveryStatuses.Open ,
            })),
          ];
          const mealPrices = MealPrice.getMealPriceFromDeliveries(
            plans,
            newDeliveries,
            updateOptions.donationCount,
          )
          const newOrder: IOrder = {
            ...copy,
            costs: {
              ...copy.costs,
              mealPrices,
            },
            isAutoGenerated: false,
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
        const upcomingOrders = cache.readQuery<myUpcomingOrdersRes>({ query: MY_UPCOMING_ORDERS_QUERY });
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
            isAutoGenerated: false,
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

type myUpcomingOrdersRes = { myUpcomingOrders: IOrder[] }
export const useGetMyUpcomingOrders = () => {
  const res = useQuery<myUpcomingOrdersRes>(MY_UPCOMING_ORDERS_QUERY);
  const orders = useMemo<Order[] | undefined>(() => (
    res.data ? res.data.myUpcomingOrders.map(order => new Order(order)) : res.data
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
  const orders = useMemo<Order[] | undefined>(() => (
    res.data ? res.data.myPaidOrders.map(order => new Order(order)) : res.data
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
  const orders = useMemo<Order[] | undefined>(() => (
    res.data ? res.data.allUpcomingOrders.map(order => new Order(order)) : res.data
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
  const orders = useMemo<Order[] | undefined>(() => (
    res.data ? res.data.allPaidOrders.map(order => new Order(order)) : res.data
  ), [res.data]);
  return {
    loading: res.loading,
    error: res.error,
    data: orders
  }
}