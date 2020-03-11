
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { Consumer } from '../../../consumer/consumerModel';

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

