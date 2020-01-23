import { Meal } from './../../../../meal/mealModel';
import { ICart, Cart } from '../../../../cart/cartModel';
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
  type res = { addToCart: ICart }
  type vars = { meal: Meal };
  const [mutate] = useMutation<res, vars>(gql`
    mutation addMealToCart($meal: Meal!) {
      addMealToCart(meal: $meal) @client
    }
  `);
  const addMealToCart = (meal: Meal) => {
    mutate({ variables: { meal } })
  }
  return addMealToCart
}

type cartMutationResolvers = {
  addMealToCart: ClientResolver<{ meal: Meal }, Cart | null>
}

export const cartMutationResolvers: cartMutationResolvers = {
  addMealToCart: (_, args, { cache }) => {
    const updateCache = (cart: Cart) => {
      const data = {
        cart
      }
      cache.writeQuery({
        query: CART_QUERY,
        data,
      });
      return cart;
    }
    const res = cache.readQuery<cartQueryRes>({ 
      query: CART_QUERY
    });
    if (res && res.cart) {
      return updateCache(res.cart.addMeal(args.meal));
    }
    return updateCache(new Cart({
      meals: [args.meal],
      restId: null,
      planId: null,
    }));
  },
}