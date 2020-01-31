import { isServer } from './../../utils/isServer';
import { deliveryDay } from './../../../consumer/consumerModel';
import { Plan } from './../../../plan/planModel';
import { getAvailablePlans } from './../../../plan/planService';
import { ApolloCache } from 'apollo-cache';
import { Meal } from '../../../rest/mealModel';
import { Cart } from '../../../cart/cartModel';
import { ClientResolver } from './localState';
import { useMutation, useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

type cartQueryRes = {
  cart: Cart | null
};

export const cartQL = gql`
  type Meal {
    _id: ID!
    img: String!
    name: String!
  }
  type Cart {
    meals: [Meal!]
    restId: ID
    planId: ID
    deliveryDay: Integer!
  }
  extend type Query {
    cart: [Meal!]!
  }
  extend type Mutation {
    addMealToCart(meal: Meal!, restId: ID!): Cart!
    removeMealFromCart(mealId: ID!): Cart!
    updateDeliveryDay(day: Integer!): Cart!
  }
`

export const cartInitialState: Cart | null = null;

const CART_QUERY = gql`
  query cart {
    cart @client
  }
`

export const useGetCart = () => {
  if (isServer()) return null;
  const queryRes = useQuery<cartQueryRes>(CART_QUERY);
  return queryRes.data ? queryRes.data.cart : null
}

export const useAddMealToCart = (): (meal: Meal, restId: string) => void => {
  type vars = { meal: Meal, restId: string };
  const [mutate] = useMutation<any, vars>(gql`
    mutation addMealToCart($meal: Meal!, $restId: ID!) {
      addMealToCart(meal: $meal, restId: $restId) @client
    }
  `);
  return (meal: Meal, restId: string) => {
    mutate({ variables: { meal, restId } })
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

export const useUpdateDeliveryDay = (): (day: deliveryDay) => void => {
  if (isServer()) return (_) => {}
  type vars = { day: deliveryDay };
  const [mutate] = useMutation<any, vars>(gql`
    mutation updateDeliveryDay($day: Integer!) {
      updateDeliveryDay(day: $day) @client
    }
  `);
  return (day: deliveryDay) => {
    mutate({ variables: { day } })
  }
}

type cartMutationResolvers = {
  addMealToCart: ClientResolver<{ meal: Meal, restId: string }, Cart | null>
  removeMealFromCart: ClientResolver<{ mealId: string }, Cart | null>
  updateDeliveryDay: ClientResolver<{ day: deliveryDay }, Cart | null>
}

const updateCartCache = (cache: ApolloCache<any>, cart: Cart) => {
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
  addMealToCart: (_, { meal, restId }, { cache }) => {
    const res = getCart(cache);
    const plans = getAvailablePlans(cache);
    if (!res || !res.cart) {
      return updateCartCache(cache, new Cart({
        meals: [meal],
        restId,
        planId: null,
        deliveryDay: null,
      }));
    }
    if (res.cart.restId && res.cart.restId !== restId) {
      throw new Error(`Cannot add meals from new restId ${restId} since cart already holds items from ${res.cart.restId}`);
    }
    if (!plans) throw new Error('Cannot add meals to cart since no available plans');
    const newCart = res.cart.addMeal(meal);
    const planId = Plan.getPlanId(newCart.Meals.length, plans.availablePlans);
    return updateCartCache(cache, new Cart({
      meals: newCart.Meals,
      restId,
      planId: planId ? planId : null,
      deliveryDay: newCart.DeliveryDay,
    }));
  },

  removeMealFromCart: (_, { mealId }, { cache }) => {
    const res = getCart(cache);
    const plans = getAvailablePlans(cache);
    if (!res || !res.cart) throw new Error(`Cannot remove mealId '${mealId}' from null cart`)
    if (!plans) throw new Error('Cannot add meals to cart since no available plans');
    let newCart = res.cart.removeMeal(mealId);
    const planId = Plan.getPlanId(newCart.Meals.length, plans.availablePlans);
    if (newCart.Meals.length === 0) {
      newCart = new Cart({
        meals: [],
        restId: null,
        planId: planId ? planId : null,
        deliveryDay: newCart.DeliveryDay,
      });
    }
    return updateCartCache(cache, new Cart({
      meals: newCart.Meals,
      restId: newCart.RestId,
      planId: planId ? planId : null,
      deliveryDay: newCart.DeliveryDay,
    }));
  },

  updateDeliveryDay: (_, { day }, { cache }) => {
    const res = getCart(cache);
    if (!res || !res.cart) throw new Error('Cannot update delivery day since cart is empty')
    return updateCartCache(cache, new Cart({
      meals: res.cart.Meals,
      restId: res.cart.RestId,
      planId: res.cart.PlanId,
      deliveryDay: day,
    }));
  },  
}