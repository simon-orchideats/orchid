//@ts-nocheck

// import { ConsumerState } from './consumerState';
// // import { Address } from './../../../location/addressModel';
// // import {
// //   deliveryDay,
// //   // ConsumerProfile,
// //   // Destination,
// //   // ConsumerPlan
// // } from './../../../consumer/consumerModel';
// import { ApolloCache } from 'apollo-cache';
// // import { Cart } from '../../../cart/cartModel';
// import { ClientResolver } from './localState';
// import { useMutation, useQuery } from '@apollo/react-hooks';
// import gql from 'graphql-tag';
// import { Consumer } from '../../../consumer/consumerModel';

// // export const consumerQL = gql`
// //   extend type Mutation {
// //     updateDeliveryDay(day: Number!): Consumer!
// //     updatePlan(stripePlanId: ID!): Consumer!
// //     updateRewneal(renewal: RenewalType!): Boolean!
// //     addCuisine(cuisne: CusineType!): Boolean!
// //     removeCuisine(cuisine: CusineType!): Boolean!
// //   }
// // `

export const consumerInitialState: Consumer | null = null;

// export const CONSUMER_QUERY = gql`
//   query consumer {
//     consumer @client
//   }
// `
// type consumerQueryRes = {
//   consumer: ConsumerState | null
// };

// export const useGetConsumer = () => {
//   const queryRes = useQuery<consumerQueryRes>(CONSUMER_QUERY);
//   return queryRes.data ? queryRes.data.consumer : null
// }

// export const useUpdateEmail = (): (email: string) => void => {
//   type vars = { email: string };
//   const [mutate] = useMutation<any, vars>(gql`
//     mutation updateEmail($email: ID!) {
//       updateEmail(email: $email) @client
//     }
//   `);
//   return (email: string) => {
//     mutate({ variables: { email } })
//   }
// }

// // export const useUpdateDeliveryDay = (): (day: deliveryDay) => void => {
// //   type vars = { day: deliveryDay };
// //   const [mutate] = useMutation<any, vars>(gql`
// //     mutation updateDeliveryDay($day: Int!) {
// //       updateDeliveryDay(day: $day) @client
// //     }
// //   `);
// //   return (day: deliveryDay) => {
// //     mutate({ variables: { day } })
// //   }
// // }

// // export const useUpdatePlan = (): (stripePlanId: string) => void => {
// //   type vars = { stripePlanId: string };
// //   const [mutate] = useMutation<any, vars>(gql`
// //     mutation updatePlan($stripePlanId: ID!) {
// //       updatePlan(stripePlanId: $stripePlanId) @client
// //     }
// //   `);
// //   return (stripePlanId: string) => {
// //     mutate({ variables: { stripePlanId } })
// //   }
// // }

// type consumerMutationResolvers = {
//   // updateDeliveryDay: ClientResolver<{ day: deliveryDay }, Consumer | null>
//   // updatePlan: ClientResolver<{ planId: string }, Consumer | null>
//   updateEmail: ClientResolver<{ email: string }, ConsumerState>
// }

// const updateConsumerCache = (cache: ApolloCache<any>, consumer: ConsumerState) => {
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
//   updateEmail: (_, { email }, { cache }) => {
//     const res = getConsumer(cache);
//     if (!res || !res.consumer) {
//       return updateConsumerCache(cache, new Consumer({
//         profile:{
//           name: null,
//           email,
//           phone: null,
//           destination: null,
//         },
//         plan: null,
//         userId: null,
//         stripeCustomerId: null,
//         stripeSubscriptionId: null,
//       }))
//     }
//     return updateCartCache(cache, new Consumer({

//     }));
//   },  
//   // updateDeliveryDay: (_, { day }, { cache }) => {
//   //   return null;
//   // },  
//   // updatePlan: (_, { planId }, { cache }) => {
//   //   return null;
//   // },
// }