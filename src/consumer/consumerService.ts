import { MutationBoolRes } from './../utils/mutationResModel';
import { ApolloError } from 'apollo-client';
import { isServer } from './../client/utils/isServer';
import { consumerFragment } from './consumerFragment';
import { Consumer } from './consumerModel';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useMemo } from 'react';
import { activeConfig } from '../config';
import { useGetConsumer } from '../client/global/state/consumerState'
import { QueryResult } from '@apollo/react-common';

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
  let res:QueryResult<res, Record<string, any>> | null;
  if (useGetConsumer()) {
    res = useGetConsumer();
  } else {
      res = useQuery<res>(gql`
        query myConsumer {
          myConsumer {
            ...consumerFragment
          }
        }
        ${consumerFragment}
      `,
    );
  }
  
  const consumer = useMemo<Consumer | null>(() => {
    if (res?.data && res.data.myConsumer) {
      // Creates userId as property and adds value from _id to userId property
      Object.defineProperty(res.data.myConsumer, 'userId', Object.getOwnPropertyDescriptor(res.data.myConsumer, '_id') as PropertyDescriptor );
      return new Consumer(res.data.myConsumer)
    } 
      return null
  }, [res?.data]);

  if (!consumer && !res?.loading && !res?.error) {
    if (!isServer()) window.location.assign(`${activeConfig.client.app.url}/login?redirect=${url}`);
    return {
      loading: res!.loading,
      error: res!.error,
      data: consumer
    }
  }

  return {
    loading: res!.loading,
    error: res!.error,
    data: consumer
  }
}
