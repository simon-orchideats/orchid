import { MutationBoolRes } from './../utils/mutationResModel';
import { ApolloError } from 'apollo-client';
import { isServer } from './../client/utils/isServer';
import { consumerFragment } from './consumerFragment';
import { IConsumer, Consumer } from './consumerModel';
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
    myConsumer: IConsumer | null
  }
  console.log('useRedquireConsumer')
  const res = useQuery<res>(
    gql`
      query myConsumer {
        myConsumer {
          ...consumerFragment
        }
      }
      ${consumerFragment}
    `,
  );
 
  console.log(`USED REQUIRED RESULTS FROM ${JSON.stringify(res.data)}`);
  if(res.data?.myConsumer) {
    // @ts-ignore
  Object.defineProperty(res.data.myConsumer, 'userId', Object.getOwnPropertyDescriptor(res.data.myConsumer, '_id')); 
    // delete res.data.['_id'];  
                }              // delete old key
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
