import { DeliveryMeal } from './../../../order/deliveryModel';
import { deliveryDay, deliveryTime, Schedule } from './../../../consumer/consumerModel';
import { ApolloCache } from 'apollo-cache';
import { Meal } from '../../../rest/mealModel';
import { Cart } from '../../../order/cartModel';
import { ClientResolver } from './localState';
import { useMutation, useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { Order } from '../../../order/orderModel';

type cartQueryRes = {
  cart: Cart | null
};

export const cartQL = gql`
  type CartState {
    donationCount: Int!
    deliveries: [DeliveryInput!]!
    schedule: Schedule
    zip: String
  }
  extend type Query {
    cart: CartState
  }
  extend type Mutation {
    clearCartMeals: CartState
    addMealToCart(meal: Meal!, restId: ID!): CartState!
    setScheduleAndAutoDeliveries(schedules: [Schedule!]!): CartState!
    decrementDonationCount: CartState!
    incrementDonationCount: CartState!
    removeMealFromCart(restId: ID!, mealId: ID!): CartState!
    setCart(order: Order!): CartState!
    updateCartPlanId(id: ID!): CartState!
    updateDeliveryDay(day: Int!): CartState!
    updateZip(zip: String!): CartState!
  }
`

export const cartInitialState: Cart | null = null;

const CART_QUERY = gql`
  query cart {
    cart @client
  }
`

export const useSetScheduleAndAutoDeliveries = (): (schedules: Schedule[]) => void => {
  type vars = { schedules: Schedule[] };
  const [mutate] = useMutation<any, vars>(gql`
    mutation setScheduleAndAutoDeliveries($schedules: [Schedule!]!) {
      setScheduleAndAutoDeliveries(schedules: $schedules) @client
    }
  `);
  return (schedules: Schedule[]) => {
    mutate({ variables: { schedules } })
  }
}

export const useGetCart = () => {
  const queryRes = useQuery<cartQueryRes>(CART_QUERY);
  return queryRes.data ? queryRes.data.cart : null
}

export const useDecrementCartDonationCount = () => {
  const [mutate] = useMutation(gql`
    mutation decrementDonationCount {
      decrementDonationCount @client
    }
  `);
  return () => {
    mutate();
  }
}

export const useIncrementCartDonationCount = () => {
  const [mutate] = useMutation(gql`
    mutation incrementDonationCount {
      incrementDonationCount @client
    }
  `);
  return () => {
    mutate();
  }
}

export const useClearCartMeals = () => {
  const [mutate] = useMutation(gql`
    mutation clearCartMeals {
      clearCartMeals @client
    }
  `);
  return () => {
    mutate();
  }
}

export const useAddMealToCart = (): (meal: Meal, restId: string, restName: string) => void => {
  type vars = { meal: Meal, restId: string, restName: string };
  const [mutate] = useMutation<any, vars>(gql`
    mutation addMealToCart($meal: Meal!, $restId: ID!, $restName: String!) {
      addMealToCart(meal: $meal, restId: $restId, restName: $restName) @client
    }
  `);
  return (meal: Meal, restId: string, restName: string) => {
    mutate({ variables: { meal, restId, restName } })
  }
}

export const useRemoveMealFromCart = (): (restId: string, mealId: string) => void => {
  type vars = { restId: string, mealId: string };
  const [mutate] = useMutation<any, vars>(gql`
    mutation removeMealFromCart($restId: ID!, $mealId: ID!) {
      removeMealFromCart(restId: $restId, mealId: $mealId) @client
    }
  `);
  return (restId: string, mealId: string) => {
    mutate({ variables: { restId, mealId } })
  }
}

export const useSetCart = (): (order: Order) => void => {
  type vars = { order: Order };
  const [mutate] = useMutation<any, vars>(gql`
    mutation setCart($order: Order!, $planId: ID!) {
      setCart(order: $order, planId: $planId) @client
    }
  `);
  return (order: Order) => {
    mutate({ variables: { order } })
  }
}

export const useUpdateCartEmail = (): (email: string) => void => {
  type vars = { email: string };
  const [mutate] = useMutation<any, vars>(gql`
    mutation updateCartEmail($email: ID!) {
      updateCartEmail(email: $email) @client
    }
  `);
  return (email: string) => {
    mutate({ variables: { email } })
  }
}

export const useUpdateCartPlanId = (): (id: string) => void => {
  type vars = { id: string };
  const [mutate] = useMutation<any, vars>(gql`
    mutation updateCartPlanId($id: ID!) {
      updateCartPlanId(id: $id) @client
    }
  `);
  return (id: string) => {
    mutate({ variables: { id } })
  }
}

export const useUpdateDeliveryDay = (): (day: deliveryDay) => void => {
  type vars = { day: deliveryDay };
  const [mutate] = useMutation<any, vars>(gql`
    mutation updateDeliveryDay($day: Int!) {
      updateDeliveryDay(day: $day) @client
    }
  `);
  return (day: deliveryDay) => {
    mutate({ variables: { day } })
  }
}

export const useUpdateDeliveryTime = (): (time: deliveryTime) => void => {
  type vars = { time: deliveryTime };
  const [mutate] = useMutation<any, vars>(gql`
    mutation updateDeliveryTime($time: Int!) {
      updateDeliveryTime(time: $time) @client
    }
  `);
  return (time: deliveryTime) => {
    mutate({ variables: { time } })
  }
}

export const useUpdateZip = (): (zip: string) => void => {
  type vars = { zip: string };
  const [mutate] = useMutation<any, vars>(gql`
    mutation updateZip($zip: Int!) {
      updateZip(zip: $zip) @client
    }
  `);
  return (zip: string) => {
    mutate({ variables: { zip } })
  }
}

type cartMutationResolvers = {
  addMealToCart: ClientResolver<{ meal: Meal, restId: string, restName: string }, Cart | null>
  setScheduleAndAutoDeliveries: ClientResolver<{ schedules: Schedule[] }, Cart | null>
  clearCartMeals: ClientResolver<undefined, Cart | null>
  decrementDonationCount: ClientResolver<undefined, Cart | null>
  incrementDonationCount: ClientResolver<undefined, Cart | null>
  removeMealFromCart: ClientResolver<{ restId: string, mealId: string }, Cart | null>
  setCart: ClientResolver<{ order: Order }, Cart | null>
  updateZip: ClientResolver<{ zip: string }, Cart | null>
}

const updateCartCache = (cache: ApolloCache<any>, cart: Cart | null) => {
  cache.writeQuery({
    query: CART_QUERY,
    data: { cart }
  });
  return cart;
}

const getCart = (cache: ApolloCache<any>) => cache.readQuery<cartQueryRes>({
  query: CART_QUERY
});

export const cartMutationResolvers: cartMutationResolvers = {
  addMealToCart: (_, { meal, restId, restName }, { cache }) => {
    const res = getCart(cache);
    const newDeliveryMeal = DeliveryMeal.getDeliveryMeal(meal, restId, restName);
    if (!res || !res.cart) {
      return updateCartCache(cache, new Cart({
        donationCount: 0,
        deliveries: [],
        restMeals: {
          [restId]: {
            mealCount: 1,
            meals: [newDeliveryMeal]
          }
        },
        schedules: [],
        zip: null,
      }));
    }
    // todo simon: add logic to put the new meal into the deliveries
    if (res.cart.getMealCount() === 0) {
      return updateCartCache(cache, new Cart({
        donationCount: res.cart.DonationCount,
        restMeals: {
          [restId]: {
            mealCount: 1,
            meals: [newDeliveryMeal]
          }
        },
        deliveries: res.cart.Deliveries,
        schedules: res.cart.Schedules,
        zip: res.cart.Zip,
      }));
    }
    const newCart = res.cart.addMeal(meal, restId, restName);
    return updateCartCache(cache, newCart);
  },

  setScheduleAndAutoDeliveries: (_, { schedules }, { cache }) => {
    const res = getCart(cache);
    if (!res || !res.cart) {
      const err = new Error(`Cannot auto set meals in deliveries from null cart`);
      console.error(err.stack);
      throw err;
    }
    // todo simon: add logic to put the new meal into the deliveries
    const newCart = res.cart.setScheduleAndAutoDeliveries(schedules);;
    return updateCartCache(cache, newCart);
  },

  decrementDonationCount: (_, _args, { cache }) => {
    const res = getCart(cache);
    if (!res || !res.cart) {
      const err = new Error(`Cannot decrement donation count from null cart`);
      console.error(err.stack);
      throw err;
    }
    return updateCartCache(cache, new Cart({
      donationCount: res.cart.DonationCount - 1,
      restMeals: res.cart.RestMeals,
      deliveries: res.cart.Deliveries,
      schedules: res.cart.Schedules,
      zip: res.cart.Zip,
    }));
  },

  incrementDonationCount: (_, _args, { cache }) => {
    const res = getCart(cache);
    if (!res || !res.cart) {
      return updateCartCache(cache, new Cart({
        donationCount: 1,
        restMeals: {},
        deliveries: [],
        schedules: [],
        zip: null,
      }));
    }
    return updateCartCache(cache, new Cart({
      donationCount: res.cart.DonationCount + 1,
      restMeals: res.cart.RestMeals,
      deliveries: res.cart.Deliveries,
      schedules: res.cart.Schedules,
      zip: res.cart.Zip,
    }));
  },

  clearCartMeals: (_, _args, { cache }) => {
    const res = getCart(cache);
    if (!res || !res.cart) {
      // possible when you skip an order and there is no cart
      return null;
    }
    return updateCartCache(cache, new Cart({
      donationCount: 0,
      restMeals: {},
      deliveries: [],
      schedules: [],
      zip: null,
    }));
  },

  removeMealFromCart: (_, { restId, mealId }, { cache }) => {
    const res = getCart(cache);
    if (!res || !res.cart) {
      const err = new Error(`Cannot remove mealId '${mealId}' from null cart`);
      console.error(err.stack);
      throw err;
    }
    let newCart = res.cart.removeMeal(restId, mealId);
    if (newCart.getMealCount() === 0) {
      newCart = new Cart({
        donationCount: newCart.DonationCount,
        restMeals: {},
        deliveries: [],
        schedules: newCart.schedules,
        zip: newCart.Zip,
      });
    }
    return updateCartCache(cache, newCart);
  },

  setCart: (_, { order }, { cache }) => {
    return updateCartCache(cache, new Cart({
      donationCount: order.DonationCount,
      restMeals: {},
      deliveries: [],
      schedules: [],
      // todo simon: figure out how to fill out meals given all deliveries
      // todo simon: do these
      // meals: order.Meals, 
      // deliveries: order.Deliveries,
      // schedule: order.Delivieries.map(d => d.Schedule),
      zip: order.Destination.Address.Zip,
    }));
  },

  updateZip: (_, { zip }, { cache }) => {
    const res = getCart(cache);
    if (!res || !res.cart) {
      return updateCartCache(cache, new Cart({
        donationCount: 0,
        deliveries: [],
        restMeals: {},
        schedules: [],
        zip,
      }));
    }
    return updateCartCache(cache, new Cart({
      donationCount: res.cart.DonationCount,
      deliveries: res.cart.Deliveries,
      restMeals: res.cart.RestMeals,
      schedules: res.cart.Schedules,
      zip,
    }));
  },
}