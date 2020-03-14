import { ApolloCache, DataProxy } from 'apollo-cache';
import { IRest, Rest } from './restModel';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { restFragment } from './restFragment';
import { useMemo } from 'react';

const useGetNearbyRests = (zip: string) => {
  type res = {
    nearbyRests: IRest[]
  }
  const res = useQuery<res>(
    gql`
      query nearbyRests($zip: String) {
        nearbyRests(zip: $zip) {
          ...restFragment
        }
      }
      ${restFragment}
    `, 
    {
      variables: { zip },
      skip: !zip,
    }
  );

  const rests = useMemo<Rest[] | undefined>(() => (
    res.data ? res.data.nearbyRests.map(rest => new Rest(rest)) : res.data
  ), [res.data]);

  return {
    loading: res.loading,
    error: res.error,
    data: rests
  }
}

const GET_REST_QUERY = gql`
  query rest($restId: ID!) {
    rest(restId: $restId) {
      ...restFragment
    }
  }
  ${restFragment}
`;

type getRestQueryRes = { rest: IRest }

const getRest = (cache: ApolloCache<any> | DataProxy, restId: string) => cache.readQuery<getRestQueryRes>({
  query: GET_REST_QUERY,
  variables: { restId }
});

const useGetRest = (restId: string | null) => {
  const res = useQuery<getRestQueryRes>(
    GET_REST_QUERY, 
    {
      skip: !restId,
      variables: { restId },
    }
  );
  return {
    loading: res.loading,
    error: res.error,
    data: res.data ? new Rest(res.data.rest) : res.data
  }
}

export {
  useGetNearbyRests,
  useGetRest,
  getRest
}
