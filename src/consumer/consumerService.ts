import { isServer } from './../client/utils/isServer';
import { consumerFragment } from './consumerFragment';
import { IConsumer, Consumer } from './consumerModel';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { useMemo } from 'react';
import { activeConfig } from '../config';

export const useRequireConsumer = (url: string) => {
  type res = {
    myConsumer: IConsumer | null
  }
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
