import { IRest, Rest } from './restModel';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { restFragment } from './restFragment';

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
  return {
    loading: res.loading,
    error: res.error,
    data: res.data ? res.data.nearbyRests.map(rest => new Rest(rest)) : res.data
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
