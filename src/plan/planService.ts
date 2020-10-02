import { ApolloCache, DataProxy } from 'apollo-cache';
import { isServer } from './../client/utils/isServer';
import gql from 'graphql-tag';
import { Plan, IPlan } from './planModel';
import { useQuery } from '@apollo/react-hooks';
import { useMemo } from 'react';

const AVAILABLE_PLANS_QUERY = gql`
  query availablePlans {
    availablePlans {
      stripeProductPriceId
      name
      numAccounts
      price
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
    const plans = res.data ? res.data.availablePlans.map(plan => Plan.getICopy(plan)) : res.data;
    if (!plans) return plans;
    plans.sort((p1, p2) => {
      if (p1.price > p2.price) return 1;
      if (p1.price < p2.price) return -1;
      return 0;
    });
    return plans;
  }, [res.data]);

  return {
    loading: res.loading,
    error: res.error,
    data: sortedPlans,
  }
}
