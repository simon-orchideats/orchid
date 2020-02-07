// import { Address } from './../../../location/addressModel';
import {
  deliveryDay,
  // ConsumerProfile,
  // Destination,
  // ConsumerPlan
} from './../../../consumer/consumerModel';
// import { ApolloCache } from 'apollo-cache';
// import { Cart } from '../../../cart/cartModel';
// import { ClientResolver } from './localState';
import { useMutation, useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { Consumer } from '../../../consumer/consumerModel';

export const consumerQL = gql`
  extend type Mutation {
    updateDeliveryDay(day: Number!): Consumer!
    updatePlan(planId: ID!): Consumer!
    updateRewneal(renewal: RenewalType!): Boolean!
    addCuisine(cuisne: CusineType!): Boolean!
    removeCuisine(cuisine: CusineType!): Boolean!
  }
`

export const consumerInitialState: Consumer | null = null;

export const CONSUMER_QUERY = gql`
  query consumer {
    consumer @client
  }
`
type consumerQueryRes = {
  consumer: Consumer | null
};

export const useGetConsumer = () => {
  const queryRes = useQuery<consumerQueryRes>(CONSUMER_QUERY);
  return queryRes.data ? queryRes.data.consumer : null
}

export const useUpdateDeliveryDay = (): (day: deliveryDay) => void => {
  type vars = { day: deliveryDay };
  const [mutate] = useMutation<any, vars>(gql`
    mutation updateDeliveryDay($day: Int!) {
      updateDeliveryDay(day: $day) @client
    }
  `);
  return (day: deliveryDay) => {
    mutate({ variables: { day } })
  }
}

export const useUpdatePlan = (): (planId: string) => void => {
  type vars = { planId: string };
  const [mutate] = useMutation<any, vars>(gql`
    mutation updatePlan($planId: ID!) {
      updatePlan(planId: $planId) @client
    }
  `);
  return (planId: string) => {
    mutate({ variables: { planId } })
  }
}

// type consumerMutationResolvers = {
//   updateDeliveryDay: ClientResolver<{ day: deliveryDay }, Consumer | null>
//   updatePlan: ClientResolver<{ planId: string }, Consumer | null>
// }

// const updateConsumerCache = (cache: ApolloCache<any>, consumer: Consumer) => {
//   cache.writeQuery({
//     query: CONSUMER_QUERY,
//     data: { consumer }
//   });
//   return consumer;
// }

// const getConsumer = (cache: ApolloCache<any>) => cache.readQuery<consumerQueryRes>({
//   query: CONSUMER_QUERY
// });

// export const consumerMutationResolvers: consumerMutationResolvers = {
//   updateDeliveryDay: (_, { day }, { cache }) => {
//     return null;
//   },  
//   updatePlan: (_, { planId }, { cache }) => {
//     return null;
//   },
// }