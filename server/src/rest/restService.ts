import { IRest, Rest } from './restModel';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

const useGetNearbyRests = (zip: string) => {
  type res = {
    nearbyRests: IRest[]
  }
  const res = useQuery<res>(
    gql`
      query nearbyRests($zip: String) {
        nearbyRests(zip: $zip) {
          _id
          location {
            address {
              address1
              address2
              city
              state
              zip
            }
          }
          menu {
            _id
            img
            name
          }
          profile {
            name
            phone
          }
        }
      }
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

export {
  useGetNearbyRests,
}
