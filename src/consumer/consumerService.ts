import { MutationBoolRes, MutationConsumerRes } from "./../utils/apolloUtils";
import { ApolloError } from 'apollo-client';
import { isServer } from './../client/utils/isServer';
import { consumerFragment } from './consumerFragment';
import { Consumer, IConsumer } from './consumerModel';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useMemo } from 'react';
import { activeConfig } from '../config';
import { ApolloCache, DataProxy } from 'apollo-cache';

const MY_CONSUMER_QUERY = gql`
  query myConsumer {
    myConsumer {
      ...consumerFragment
    }
  }
  ${consumerFragment}
`

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

type myConsumerRes = { myConsumer: IConsumer | null}

export const getMyConsumer = (cache: ApolloCache<any> | DataProxy) => cache.readQuery<myConsumerRes>({
  query: MY_CONSUMER_QUERY
});
export const updateMyConsumer = (cache: ApolloCache<any> | DataProxy, consumer: IConsumer) => {
  //@ts-ignore
  consumer.plan.__typename = 'ConsumerPlan';
  //@ts-ignore
  consumer.profile.__typename = 'ConsumerProfile';
  //@ts-ignore
  consumer.profile.card.__typename = 'Card';
  //@ts-ignore
  consumer.profile.destination.address.__typename  = 'Address'
  //@ts-ignore
  consumer.profile.destination.__typename = 'Destination'
  //@ts-ignore
  consumer.__typename = 'Consumer';
  cache.writeQuery<myConsumerRes>({
    query: MY_CONSUMER_QUERY,
    data: {
      myConsumer: consumer
    }
  });
}

export const useRequireConsumer = (url: string) => {
  const res = useQuery<myConsumerRes>(MY_CONSUMER_QUERY);
  const consumer = useMemo<Consumer | null>(() => (
    res.data && res.data.myConsumer ? new Consumer(res.data.myConsumer) : null
  ), [res.data]);
  if (!consumer && !res.loading && !res.error) {
    if (!isServer()) window.location.assign(`${activeConfig.client.app.url}/login?redirect=${url}`);
    return {
      loading: res.loading,
      error: res.error,
      data: consumer
    }
  }
  return {
    loading: res.loading,
    error: res.error,
    data: consumer
  }
}

export const useSignUp = (): [
  (email: string, name: string, pass: string) => void,
  {
    error?: ApolloError 
    data?: MutationConsumerRes
  }
] => {
  type res = { signUp: MutationConsumerRes };
  type vars = { email: string, name: string, pass: string }
  const [mutate, mutation] = useMutation<res,vars>(gql`
    mutation signUp($email: String!, $name: String!, $pass: String!) {
      signUp(email: $email, name: $name, pass: $pass) {
        res {
          ...consumerFragment
        }
        error
      }
    }
    ${consumerFragment}
  `);
  const signUp = (email: string, name: string, pass: string) => {
    mutate({
      variables: { email, name, pass },
      update: (cache, { data }) => {
        if (data && data.signUp.res) {
          cache.writeQuery({
            query: MY_CONSUMER_QUERY,
            data: {
              myConsumer: data.signUp.res,
            }
          })
        }
      }
    })
  }
  return useMemo(() => [
    signUp,
    {
      error: mutation.error,
      data: mutation.data ? mutation.data.signUp : undefined,
    }
  ], [mutation]);
}
