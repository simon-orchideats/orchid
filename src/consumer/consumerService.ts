import { MutationBoolRes } from './../utils/mutationResModel';
import { ApolloError } from 'apollo-client';
import { isServer } from './../client/utils/isServer';
import { consumerFragment } from './consumerFragment';
import { Consumer } from './consumerModel';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useMemo } from 'react';
import { activeConfig } from '../config';

export const useAddConsumerEmail = (): [
  (email: string) => void,
  {
    error?: ApolloError 
    data?: MutationBoolRes
  }
] => {
  type res = { insertEmail: MutationBoolRes };
  type vars = { email: string }
  const [mutate, mutation] = useMutation<res,vars>(gql`
    mutation insertEmail($email: String!) {
      insertEmail(email: $email) {
        res
        error
      }
    }
  `);
  const addConsumerEmail = (email: string) => {
    mutate({ variables: { email } })
  }
  return useMemo(() => [
    addConsumerEmail,
    {
      error: mutation.error,
      data: mutation.data ? mutation.data.insertEmail : undefined,
    }
  ], [mutation]);
}

export const useRequireConsumer = (url: string) => {
  type res = {
    myConsumer: Consumer | null
  }
  const res = useQuery<res>(gql`
    query myConsumer {
      myConsumer {
        ...consumerFragment
      }
    }
      ${consumerFragment}
    `,
  );

  const consumer = useMemo<Consumer | null>(() => (
    res.data && res.data.myConsumer ? new Consumer(res.data.myConsumer) : null
  ), [res.data]);
  if (!consumer && !res.loading && !res.error) {
    if (!isServer()) window.location.assign(`${activeConfig.client.app.url}/login?redirect=${url}`);
    return {
      loading: res!.loading,
      error: res!.error,
      data: consumer
    }
  }

  return {
    loading: res!.loading,
    error: res?.error,
    data: consumer
  }
}

export const useSignUp = (): [
  (email: string, name: string, pass: string) => void,
  {
    error?: ApolloError 
    data?: MutationBoolRes
  }
] => {
  type res = { signUp: MutationBoolRes };
  type vars = { email: string, name: string, pass: string }
  const [mutate, mutation] = useMutation<res,vars>(gql`
    mutation signUp($email: String!, $name: String!, $pass: String!) {
      signUp(email: $email, name: $name, pass: $pass) {
        res
        error
      }
    }
  `);
  const signUp = (email: string, name: string, pass: string) => {
    mutate({ variables: { email, name, pass } })
  }
  return useMemo(() => [
    signUp,
    {
      error: mutation.error,
      data: mutation.data ? mutation.data.signUp : undefined,
    }
  ], [mutation]);
}
