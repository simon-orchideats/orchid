import { ICart, Cart } from './cartModel';
import { ClientResolver } from '../localState';
import { useQuery, useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';

type cartQueryRes = {
  cart: ICart | null
};

export const cartTypeDefs = gql`
  extend type Query {
    cart: [String!]!
  }
  extend type Mutation {
    addToCart(plan: String!): [String!]!
  }
`

export const cartInitialState: ICart | null = null;

export const CART_QUERY = gql`
  query cart {
    cart @client
  }
`

export const useGetCart = () => {
  const queryRes = useQuery<cartQueryRes>(CART_QUERY);
  const cart: ICart | null = queryRes.data ? queryRes.data.cart : null
  return cart ? new Cart(cart) : null
}

export const useAddToCart = (): (plan: string) => void => {
  type res = { addToCart: ICart }
  type vars = { plan: string };
  const [mutate] = useMutation<res, vars>(gql`
    mutation addToCart($plan: String!) {
      addToCart(plan: $plan) @client
    }
  `);
  const addToCart = (plan: string) => {
    mutate({ variables: { plan } })
  }
  return addToCart
}

type cartMutationResolvers = {
  addToCart: ClientResolver<{ plan: string }, ICart | null>
}

export const cartMutationResolvers: cartMutationResolvers = {
  addToCart: (_, { plan }, { cache }) => {
    const updateCache = (plan: ICart['plan']) => {
      const data = {
        cart: {
          plan,
        }
      }
      cache.writeQuery({
        query: CART_QUERY,
        data,
      });
      return data;
    }
    const res = cache.readQuery<cartQueryRes>({ 
      query: CART_QUERY
    });
    if (res && res.cart) {
      return updateCache([...res.cart.plan, plan]).cart;
    }
    return updateCache([plan]).cart;
  },
}