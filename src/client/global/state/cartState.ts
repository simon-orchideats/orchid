import { ApolloCache } from 'apollo-cache';
import { Meal } from '../../../rest/mealModel';
import { Cart } from '../../../cart/cartModel';
import { ClientResolver } from './localState';
import { useQuery, useMutation } from '@apollo/react-hooks';
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
  }
  extend type Query {
    cart: [Meal!]!
  }
  extend type Mutation {
    addToCart(plan: String!): [String!]!
  }
`

export const cartInitialState: Cart | null = null;

export const CART_QUERY = gql`
  query cart {
    cart @client
  }
`

export const useGetCart = () => {
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
    mutation removeMealFromCart($mealId: String!) {
      removeMealFromCart(mealId: $mealId) @client
    }
  `);
  return (mealId: string) => {
    mutate({ variables: { mealId } })
  }
}

type cartMutationResolvers = {
  addMealToCart: ClientResolver<{ meal: Meal, restId: string }, Cart | null>
  removeMealFromCart: ClientResolver<{ mealId: string }, Cart | null>
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
    if (!res || !res.cart) {
      return updateCartCache(cache, new Cart({
        meals: [meal],
        restId,
        planId: null,
      }));
    }
    if (res.cart.restId && res.cart.restId !== restId) {
      throw new Error(`Cannot add meals from new restId ${restId} since cart already holds items from ${res.cart.restId}`);
    }
    const newCart = res.cart.addMeal(meal);
    return updateCartCache(cache, new Cart({
      meals: newCart.Meals,
      restId,
      planId: newCart.PlanId
    }));
  },

  removeMealFromCart: (_, { mealId }, { cache }) => {
    const res = getCart(cache);
    if (!res || !res.cart) throw new Error(`Cannot remove mealId '${mealId}' from null cart`)
    let newCart = res.cart.removeMeal(mealId);
    if (newCart.Meals.length === 0) {
      newCart = new Cart({
        meals: [],
        restId: null,
        planId: newCart.PlanId,
      });
    }
    return updateCartCache(cache, newCart);
  },
}