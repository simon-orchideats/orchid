import { ApolloCache, DataProxy } from 'apollo-cache';
import { isServer } from './../client/utils/isServer';
import gql from 'graphql-tag';
import { Plan } from './planModel';
import { useQuery } from '@apollo/react-hooks';
import { useMemo } from 'react';

const AVAILABLE_PLANS_QUERY = gql`
  query availablePlans {
    availablePlans {
      isActive
      stripePlanId
      name
      tiers {
        maxMeals
        minMeals
        mealPrice
      }
    }
  }
`

type availablePlansQueryRes = { availablePlans: Plan[] }

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
    if (!plans) return plans;
    plans.forEach(p => p.Tiers.sort((t1, t2) => {
      if (t1.maxMeals === t2.maxMeals) return 0;
      if (t1.maxMeals === null) return 1;
      if (t2.maxMeals === null) return -1;
      if (t1.maxMeals > t2.maxMeals) return 1;
      return -1;
    }));
    plans.sort((p1, p2) => {
      if (p1.Tiers[0].mealPrice > p2.Tiers[0].mealPrice) return 1;
      return -1;
    });
    return plans;
  }, [res.data]);

  return {
    loading: res.loading,
    error: res.error,
    data: sortedPlans,
  }
}
