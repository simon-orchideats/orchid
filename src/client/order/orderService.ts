import { ICartInput } from './../../cart/cartModel';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import { ApolloError } from 'apollo-client';
import { useMemo } from 'react';

export const usePlaceOrder = (): [
  (cart: ICartInput) => void,
  {
    error?: ApolloError 
    data?: boolean
  }
] => {
  type res = { placeOrder: boolean };
  type vars = { cart: ICartInput }
  const [mutate, mutation] = useMutation<res,vars>(gql`
    mutation placeOrder($cart: CartInput!) {
      placeOrder(cart: $cart)
    }
  `);
  const placeOrder = (cart: ICartInput) => {
    mutate({ variables: { cart } })
  }
  return useMemo(() => [
    placeOrder,
    {
      error: mutation.error,
      data: mutation.data ? mutation.data.placeOrder : undefined,
    }
  ], [mutation]);
}