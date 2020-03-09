
// import { Address } from './../../../location/addressModel';
// import {
//   deliveryDay,
//   // ConsumerProfile,
//   // Destination,
//   // ConsumerPlan
// } from './../../../consumer/consumerModel';
import { ApolloCache } from 'apollo-cache';
// // import { Cart } from '../../../cart/cartModel';
// import { ClientResolver } from './localState';
import { useQuery, useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { Consumer } from '../../../consumer/consumerModel';
import { ClientResolver } from './localState';

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

type consumerQueryRes = {
  consumer: Consumer | null
};

export const consumerQL = gql`
  type ConsumerState {
    _id: ID!
    plan: ConsumerPlan!
    profile: ConsumerProfile!
  }
  extend type Query {
    consumer: ConsumerState
  }
  extend type Mutation {
    setConsumerState(consumer: ConsumerState!): ConsumerState!
  }
`

export const CONSUMER_QUERY = gql`
  query consumer {
    consumer @client
  }
`

export const useGetConsumer = () => {
  const queryRes = useQuery<consumerQueryRes>(CONSUMER_QUERY);
  console.log(queryRes.data);
  return queryRes.data ? queryRes.data.consumer : null
}

export const useSetConsumerState = (): (consumer: Consumer) => void => {
  type vars = { consumer: Consumer };
  const [mutate] = useMutation<any, vars>(gql`
    mutation setConsumerState($consumer: Consumer!) {
      setConsumerState(consumer: $consumer) @client
    }
  `);
  return (consumer: Consumer) => {
    mutate({ variables: { consumer } })
  }
}

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

type consumerMutationResolvers = {
  // updateDeliveryDay: ClientResolver<{ day: deliveryDay }, Consumer | null>
  // updatePlan: ClientResolver<{ planId: string }, Consumer | null>
  // updateEmail: ClientResolver<{ email: string }, Consumer>
  setConsumerState: ClientResolver<{consumer:Consumer}, Consumer | null>
}

const updateConsumerCache = (cache: ApolloCache<any>, consumer: Consumer) => {
  console.log("test");
  cache.writeQuery({
    query: CONSUMER_QUERY,
    data: { consumer }
  });
  return consumer;
}

// // const getConsumer = (cache: ApolloCache<any>) => cache.readQuery<consumerQueryRes>({
// //   query: CONSUMER_QUERY
// // });

export const consumerMutationResolvers: consumerMutationResolvers = {
  setConsumerState: (_, {consumer}, {cache}) => {
    return updateConsumerCache(cache, consumer);
  }
  // updateEmail: (_, { email }:{email:string}, { cache }:{cache:ApolloCache<any>}) => {
  //   const res = getConsumer(cache);
  //   if (!res || !res.consumer) {
  //     return updateConsumerCache(cache, new Consumer({
  //       profile:{
  //         name: '',
  //         email,
  //         phone: '',
  //         destination: null,
  //       },
  //       plan: null,
  //       userId: '',
  //       stripeCustomerId: '',
  //       stripeSubscriptionId: '',
  //     }))
  //   }
  // },  
  // updateDeliveryDay: (_, { day }, { cache }) => {
  //   return null;
  // },  
  // updatePlan: (_, { planId }, { cache }) => {
  //   return null;
  // },
}