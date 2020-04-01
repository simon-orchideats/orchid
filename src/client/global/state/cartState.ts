import { CartMeal } from './../../../order/cartModel';
import { deliveryDay, deliveryTime } from './../../../consumer/consumerModel';
import { ApolloCache } from 'apollo-cache';
import { Meal } from '../../../rest/mealModel';
import { Cart } from '../../../order/cartModel';
import { ClientResolver } from './localState';
import { useMutation, useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { Order } from '../../../order/orderModel';
import moment from 'moment';

type cartQueryRes = {
  cart: Cart | null
};

export const cartQL = gql`
  type CartState {
    meals: [CartMeal!]!
    donationCount: Int!
    restId: ID
    restName: String
    stripePlanId: ID
    deliveryDay: Int
    zip: String
    deliveryTime: DeliveryTime
  }
  extend type Query {
    cart: CartState
  }
  extend type Mutation {
    clearCartMeals: CartState
    addMealToCart(meal: Meal!, restId: ID!): CartState!
    decrementDonationCount: CartState!
    incrementDonationCount: CartState!
    removeMealFromCart(mealId: ID!): CartState!
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

export const useRemoveMealFromCart = (): (mealId: string) => void => {
  type vars = { mealId: string };
  const [mutate] = useMutation<any, vars>(gql`
    mutation removeMealFromCart($mealId: ID!) {
      removeMealFromCart(mealId: $mealId) @client
    }
  `);
  return (mealId: string) => {
    mutate({ variables: { mealId } })
  }
}

export const useSetCart = (): (order: Order, planId: string) => void => {
  type vars = { order: Order, planId: string };
  const [mutate] = useMutation<any, vars>(gql`
    mutation setCart($order: Order!, $planId: ID!) {
      setCart(order: $order, planId: $planId) @client
    }
  `);
  return (order: Order, planId: string) => {
    mutate({ variables: { order, planId } })
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
  clearCartMeals: ClientResolver<undefined, Cart | null>
  decrementDonationCount: ClientResolver<undefined, Cart | null>
  incrementDonationCount: ClientResolver<undefined, Cart | null>
  removeMealFromCart: ClientResolver<{ mealId: string }, Cart | null>
  setCart: ClientResolver<{ order: Order, planId: string }, Cart | null>
  updateCartPlanId: ClientResolver<{ id: string }, Cart | null>
  updateDeliveryDay: ClientResolver<{ day: deliveryDay }, Cart | null>
  updateDeliveryTime: ClientResolver<{ time: deliveryTime }, Cart | null>
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
    const newCartMealInput = CartMeal.getCartMeal(meal);
    if (!res || !res.cart) {
      return updateCartCache(cache, new Cart({
        donationCount: 0,
        deliveryTime: null,
        meals: [newCartMealInput],
        restId,
        restName,
        stripePlanId: null,
        deliveryDay: null,
        zip: null,
      }));
    }
    if (res.cart.restId && res.cart.restId !== restId) {
      const err = new Error(`Cannot add meals from new restId '${restId}' since cart already holds items from '${res.cart.restId}'`);
      console.error(err.stack);
      throw err;
    }
    if (Cart.getMealCount(res.cart.Meals) === 0) {
      return updateCartCache(cache, new Cart({
        donationCount: res.cart.DonationCount,
        deliveryTime: res.cart.DeliveryTime,
        meals: [newCartMealInput],
        restId,
        restName,
        stripePlanId: res.cart.StripePlanId,
        deliveryDay: res.cart.DeliveryDay,
        zip: res.cart.Zip,
      }));
    }
    const newCart = res.cart.addMeal(meal);
    return updateCartCache(cache, new Cart({
      donationCount: newCart.DonationCount,
      deliveryTime: newCart.DeliveryTime,
      meals: newCart.Meals,
      restId,
      restName,
      stripePlanId: newCart.StripePlanId,
      deliveryDay: newCart.DeliveryDay,
      zip: newCart.Zip,
    }));
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
      deliveryTime: res.cart.DeliveryTime,
      meals: res.cart.Meals,
      restId: res.cart.RestId,
      restName: res.cart.RestName,
      stripePlanId: res.cart.StripePlanId,
      deliveryDay: res.cart.DeliveryDay,
      zip: res.cart.Zip,
    }));
  },

  incrementDonationCount: (_, _args, { cache }) => {
    const res = getCart(cache);
    if (!res || !res.cart) {
      return updateCartCache(cache, new Cart({
        donationCount: 1,
        deliveryTime: null,
        meals: [],
        restId: null,
        restName: null,
        stripePlanId: null,
        deliveryDay: null,
        zip: null,
      }));
    }
    return updateCartCache(cache, new Cart({
      donationCount: res.cart.DonationCount + 1,
      deliveryTime: res.cart.DeliveryTime,
      meals: res.cart.Meals,
      restId: res.cart.RestId,
      restName: res.cart.RestName,
      stripePlanId: res.cart.StripePlanId,
      deliveryDay: res.cart.DeliveryDay,
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
      deliveryTime: res.cart.DeliveryTime,
      meals: [],
      restId: null,
      restName: null,
      stripePlanId: null,
      deliveryDay: res.cart.DeliveryDay,
      zip: res.cart.Zip,
    }));
  },

  removeMealFromCart: (_, { mealId }, { cache }) => {
    const res = getCart(cache);
    if (!res || !res.cart) {
      const err = new Error(`Cannot remove mealId '${mealId}' from null cart`);
      console.error(err.stack);
      throw err;
    }
    let newCart = res.cart.removeMeal(mealId);
    const mealCount = Cart.getMealCount(newCart.Meals);
    if (mealCount === 0) {
      newCart = new Cart({
        donationCount: newCart.DonationCount,
        deliveryTime: newCart.DeliveryTime,
        meals: [],
        restId: null,
        restName: null,
        stripePlanId: newCart.StripePlanId,
        deliveryDay: newCart.DeliveryDay,
        zip: newCart.Zip,
      });
    }
    return updateCartCache(cache, newCart);
  },

  setCart: (_, { order, planId }, { cache }) => {
    return updateCartCache(cache, new Cart({
      donationCount: order.DonationCount,
      deliveryTime: order.DeliveryTime,
      meals: order.Meals,
      restId: order.Rest ? order.Rest.Id : null,
      restName: order.Rest ? order.Rest.Profile.Name : null,
      stripePlanId: planId,
      deliveryDay: moment(order.DeliveryDate).day() as deliveryDay,
      zip: order.Destination.Address.Zip,
    }));
  },

  updateCartPlanId: (_, { id }, { cache }) => {
    const res = getCart(cache);
    if (!res || !res.cart) {
      return updateCartCache(cache, new Cart({
        donationCount: 0,
        deliveryTime: null,
        meals: [],
        restId: null,
        restName: null,
        stripePlanId: id,
        deliveryDay: null,
        zip: null,
      }));
    }
    return updateCartCache(cache, new Cart({
      donationCount: res.cart.DonationCount,
      deliveryTime: res.cart.DeliveryTime,
      meals: res.cart.Meals,
      restId: res.cart.RestId,
      restName: res.cart.RestName,
      stripePlanId: id,
      deliveryDay: res.cart.DeliveryDay,
      zip: res.cart.Zip,
    }));
  },

  updateDeliveryDay: (_, { day }, { cache }) => {
    const res = getCart(cache);
    if (!res || !res.cart) {
      const err = new Error('Cannot update delivery day since cart is empty');
      console.error(err.stack);
      throw err;
    }
    return updateCartCache(cache, new Cart({
      donationCount: res.cart.DonationCount,
      deliveryTime: res.cart.DeliveryTime,
      meals: res.cart.Meals,
      restId: res.cart.RestId,
      restName: res.cart.RestName,
      stripePlanId: res.cart.stripePlanId,
      deliveryDay: day,
      zip: res.cart.Zip,
    }));
  },

  updateDeliveryTime: (_, { time }, { cache }) => {
    const res = getCart(cache);
    if (!res || !res.cart) {
      const err = new Error('Cannot update delivery time since cart is empty');
      console.error(err.stack);
      throw err;
    }
    return updateCartCache(cache, new Cart({
      donationCount: res.cart.DonationCount,
      meals: res.cart.Meals,
      restId: res.cart.RestId,
      restName: res.cart.RestName,
      stripePlanId: res.cart.stripePlanId,
      deliveryDay: res.cart.DeliveryDay,
      deliveryTime: time,
      zip: res.cart.Zip,
    }));
  },

  updateZip: (_, { zip }, { cache }) => {
    const res = getCart(cache);
    if (!res || !res.cart) {
      return updateCartCache(cache, new Cart({
        donationCount: 0,
        deliveryTime: null,
        meals: [],
        restId: null,
        restName: null,
        stripePlanId: null,
        deliveryDay: null,
        zip,
      }));
    }
    return updateCartCache(cache, new Cart({
      donationCount: res.cart.DonationCount,
      deliveryTime: res.cart.DeliveryTime,
      meals: res.cart.Meals,
      restId: res.cart.RestId,
      restName: res.cart.RestName,
      stripePlanId: res.cart.stripePlanId,
      deliveryDay: res.cart.DeliveryDay,
      zip,
    }));
  },
}