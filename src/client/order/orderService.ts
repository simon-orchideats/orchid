import { MutationBoolRes } from './../utils/mutationResModel';
import { ICartInput } from '../../order/cartModel';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import { ApolloError } from 'apollo-client';
import { useMemo } from 'react';

export const usePlaceOrder = (): [
  (cart: ICartInput) => void,
  {
    error?: ApolloError 
    data?: MutationBoolRes
  }
] => {
  type res = { placeOrder: MutationBoolRes };
  type vars = { cart: ICartInput }
  const [mutate, mutation] = useMutation<res,vars>(gql`
    mutation placeOrder($cart: CartInput!) {
      placeOrder(cart: $cart) {
        res
        error
      }
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