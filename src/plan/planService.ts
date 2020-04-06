import { ApolloCache, DataProxy } from 'apollo-cache';
import { isServer } from './../client/utils/isServer';
import gql from 'graphql-tag';
import { IPlan, Plan } from './planModel';
import { useQuery } from '@apollo/react-hooks';
import { useMemo } from 'react';

const AVAILABLE_PLANS_QUERY = gql`
  query availablePlans {
    availablePlans {
      maxMeals
      minMeals
      mealPrice
    }
  }
`

type availablePlansQueryRes = { availablePlans: IPlan[] }

export const getAvailablePlans = (cache: ApolloCache<any> | DataProxy) => cache.readQuery<availablePlansQueryRes>({
  query: AVAILABLE_PLANS_QUERY
});

export const useGetAvailablePlans = () => {
  if (isServer()) {
    return {
      loading: true,
      error: undefined,
      data: undefined,
    }
  }
  const res = useQuery<availablePlansQueryRes>(AVAILABLE_PLANS_QUERY);
  const sortedPlans = useMemo(() => {
    const plans = res.data ? res.data.availablePlans.map(plan => new Plan(plan)) : res.data;
    return plans && plans.sort((p1, p2) => {
      if (p1.maxMeals === p2.maxMeals) return 0;
      if (p1.maxMeals === null) return 1;
      if (p2.maxMeals === null) return -1;
      if (p1.maxMeals > p2.maxMeals) return 1;
      return -1;
    });
  }, [res.data]);

  return {
    loading: res.loading,
    error: res.error,
    data: sortedPlans,
  }
}
