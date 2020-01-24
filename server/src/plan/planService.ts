import gql from 'graphql-tag';
import { IPlan, Plan } from './planModel';
import { useQuery } from '@apollo/react-hooks';

const useGetAvailablePlans = () => {
  type res = {
    availablePlans: IPlan[]
  }
  const res = useQuery<res>(gql`
    query availablePlans {
      availablePlans {
        _id
        mealPrice
        mealCount
        weekPrice
      }
    }
  `);
  return {
    loading: res.loading,
    error: res.error,
    data: res.data ? res.data.availablePlans.map(plan => new Plan(plan)) : res.data
  }
}

export {
  useGetAvailablePlans,
}
