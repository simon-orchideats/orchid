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

const useGetRest = (restId: string | null) => {
  type res = {
    rest: IRest
  }
  const res = useQuery<res>(
    gql`
      query rest($restId: ID!) {
        rest(restId: $restId) {
          ...restFragment
        }
      }
      ${restFragment}
    `, 
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
  useGetRest
}
