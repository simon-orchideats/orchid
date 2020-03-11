import { ApolloCache } from 'apollo-cache';
import { useQuery, useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { Consumer } from '../../../consumer/consumerModel';
import { ClientResolver } from './localState';
import { consumerFragment } from '../../../consumer/consumerFragment';

type consumerQueryRes = {
  myConsumer: Consumer | null
};

export const consumerQL = gql`
  type ConsumerState {
    _id: ID!
    plan: ConsumerPlan!
    profile: ConsumerProfile!
  }
  extend type Query {
    myConsumer: ConsumerState
  }
  extend type Mutation {
    setConsumerState(consumer: ConsumerState!): ConsumerState!
  }
`

export const CONSUMER_QUERY = gql`
  query myConsumer {
    myConsumer @client {
      ...consumerFragment
    }
  }
  ${consumerFragment}
`

export const useGetConsumer = () => {
  const queryRes = useQuery<consumerQueryRes>(CONSUMER_QUERY);
  return queryRes.data ? queryRes : null
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

type consumerMutationResolvers = {
  setConsumerState: ClientResolver<{consumer:Consumer}, Consumer | null>
}

const updateConsumerCache = (cache: ApolloCache<any>, consumer: Consumer): Consumer | null => {
  cache.writeQuery({
    query: CONSUMER_QUERY,
    data: { consumer }
  });
  return consumer;
}

export const consumerMutationResolvers: consumerMutationResolvers = {
  setConsumerState: (_, { consumer }, { cache }) => {
    return updateConsumerCache(cache, consumer);
  },
}