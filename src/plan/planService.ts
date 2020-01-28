import { isServer } from './../client/utils/isServer';
import gql from 'graphql-tag';
import { IPlan, Plan } from './planModel';
import { useQuery } from '@apollo/react-hooks';
import { useMemo } from 'react';

const useGetAvailablePlans = () => {
  if (isServer()) {
    return {
      loading: true,
      error: false,
      data: undefined,
    }
  }
  const res = useQuery<{
    availablePlans: IPlan[]
  }>(gql`
      query availablePlans {
        availablePlans {
          _id
          mealPrice
          mealCount
          weekPrice
        }
      }
    `,
  );
  
  const sortedPlans = useMemo(() => {
    const plans = res.data ? res.data.availablePlans.map(plan => new Plan(plan)) : res.data;
    return plans && plans.sort((p1, p2) => {
      if (p1.MealCount === p2.MealCount) return 0;
      if (p1.MealCount > p2.MealCount) return 1;
      return -1;
    });
  }, [res.data]);

  return {
    loading: res.loading,
    error: res.error,
    data: sortedPlans,
  }
}

export {
  useGetAvailablePlans,
}
