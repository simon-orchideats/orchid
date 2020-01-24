import { ApolloCache } from 'apollo-cache';
import { Meal } from '../../../../rest/mealModel';
import { Cart } from '../../../../cart/cartModel';
import { ClientResolver } from '../localState';
import { useQuery, useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';

type cartQueryRes = {
  cart: Cart | null
};

export const cartTypeDefs = gql`
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

export const useAddMealToCart = (): (meal: Meal) => void => {
  type vars = { meal: Meal };
  const [mutate] = useMutation<any, vars>(gql`
    mutation addMealToCart($meal: Meal!) {
      addMealToCart(meal: $meal) @client
    }
  `);
  return (meal: Meal) => {
    mutate({ variables: { meal } })
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
  addMealToCart: ClientResolver<{ meal: Meal }, Cart | null>
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
  addMealToCart: (_, { meal }, { cache }) => {
    const res = getCart(cache);
    if (res && res.cart) return updateCartCache(cache, res.cart.addMeal(meal));
    return updateCartCache(cache, new Cart({
      meals: [meal],
      restId: null,
      planId: null,
    }));
  },

  removeMealFromCart: (_, { mealId }, { cache }) => {
    const res = getCart(cache);
    if (res && res.cart) return updateCartCache(cache, res.cart.removeMeal(mealId));
    throw new Error(`Cannot remove mealId '${mealId}' from null cart`)
  },
}