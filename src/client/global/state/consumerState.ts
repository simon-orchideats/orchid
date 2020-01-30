// @ts-nocheck

// import {
//   deliveryDay,
//   ConsumerProfile,
//    Destination,
//    ConsumerPlan
//   } from './../../../consumer/consumerModel';
// import { ApolloCache } from 'apollo-cache';
// import { Cart } from '../../../cart/cartModel';
// import { ClientResolver } from './localState';
// import { useMutation, useQuery } from '@apollo/react-hooks';
// import gql from 'graphql-tag';
// import { Consumer } from '../../../consumer/consumerModel';

// export const consumerQL = gql`
//   type Name {
//     firstName: String!
//     lastName: String!
//   }
//   type Card {
//     _id: ID!
//     last4: String!
//     expMonth: Int!
//     expYear: Int!
//   }
//   type Destination {
//     location: Location!
//     instructions: String!
//   }
//   type ConsumerProfile {
//     name: Name!
//     email: String!
//     phone: String!
//     card: Card!
//     destination: Destination!
//   }
//   enum CuisineType {
//     American
//     BBQ
//     Chinese
//     Indian
//     Italian
//     Japanese
//     Mediterranean
//     Mexican
//     Thai
//     Vegan
//     Vegetarian
//   }
//   enum RenewalType {
//     Skip
//     Auto
//   }
//   type ConsumerPlan {
//     planId: String!
//     deliveryDay: Integer
//     renewal: RenewalType
//     cuisines: [CuisineType!]
//   }
//   type Consumer {
//     profile: ConsumerProfile
//     plan: ConsumerPlan
//   }
//   extend type Query {
//     consumer: Consumer
//   }
//   extend type Mutation {
//     updateDeliveryDay(day: Number!): Consumer!
//     updatePlan(planId: ID!): Consumer!
//     # updateRewneal(renewal: RenewalType!): Boolean!
//     # addCuisine(cuisne: CusineType!): Boolean!
//     # removeCuisine(cuisine: CusineType!): Boolean!
//   }
// `

// export const consumerInitialState: Consumer | null = null;

// export const CONSUMER_QUERY = gql`
//   query consumer {
//     consumer @client
//   }
// `
// type consumerQueryRes = {
//   consumer: Consumer | null
// };

// export const useGetConsumer = () => {
//   const queryRes = useQuery<consumerQueryRes>(CONSUMER_QUERY);
//   return queryRes.data ? queryRes.data.consumer : null
// }

// export const useUpdateDeliveryDay = (): (day: deliveryDay) => void => {
//   type vars = { day: deliveryDay };
//   const [mutate] = useMutation<any, vars>(gql`
//     mutation updateDeliveryDay($day: Integer!) {
//       updateDeliveryDay(day: $day) @client
//     }
//   `);
//   return (day: deliveryDay) => {
//     mutate({ variables: { day } })
//   }
// }

// export const useUpdatePlan = (): (planId: string) => void => {
//   type vars = { planId: string };
//   const [mutate] = useMutation<any, vars>(gql`
//     mutation updatePlan($planId: ID!) {
//       updatePlan(planId: $planId) @client
//     }
//   `);
//   return (planId: string) => {
//     mutate({ variables: { planId } })
//   }
// }

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
//     const res = getConsumer(cache);
//     if (!res || !res.consumer) throw new Error('Missing consumer');
//     return updateConsumerCache(cache, new Consumer({
//       plan: new ConsumerPlan({
//         planId: res.consumer.Plan.PlanId,
//         deliveryDay: day,
//       })
//     }));
//   },  
//   updatePlan: (_, { planId }, { cache }) => {
//     const res = getConsumer(cache);
//     if (!res || !res.consumer) {
//       return updateConsumerCache(cache, new Consumer({
//         plan: new ConsumerPlan({
//           planId
//         })
//       }));
//     }
//     return updateConsumerCache(cache, new Consumer({
//       plan: new ConsumerPlan({
//         planId: res.consumer.Plan.PlanId,
//       })
//     }));
//   },
// }