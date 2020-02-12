import { ConsumerPlanQL } from './server/consumer/consumerPlanQL';
import { DestinationQL } from './server/place/destinationQL';
import { AddressQL } from './server/place/addressQL';
import { CardQL } from './server/card/cardQL';
import { CartInputQL } from './server/orders/cartInputQL';
import { LocationQL } from './server/place/locationQL';
import { RestQueryResolvers } from './server/rests/restResolvers';
import { RestQL } from './server/rests/restQL';
import { PlanQueryResolvers } from './server/plans/planResolvers';
import { merge } from 'lodash';
import { gql, makeExecutableSchema } from 'apollo-server';
import { PlanQL } from './server/plans/planQL';
import { OrderMutationResolvers } from './server/orders/orderResolvers';
import { ConsumerQL } from './server/consumer/consumerQL';

const query = gql`
  type Query {
    availablePlans: [Plan!]!
    nearbyRests(zip: String): [Rest!]!
    rest(restId: ID!): Rest!
  }
`

const mutation = gql`
  type Mutation {
    placeOrder(cart: CartInput!): Boolean!
  }
`

const gqlSchema = gql`
  schema {
    query: Query
    mutation: Mutation
  }
`

const typeDefs = [
  ConsumerPlanQL,
  AddressQL,
  CardQL,
  ConsumerQL,
  CartInputQL,
  DestinationQL,
  LocationQL,
  PlanQL,
  RestQL,
  query,
  mutation,
  gqlSchema,
];

const resolvers = {
  Query: merge(
    RestQueryResolvers,
    PlanQueryResolvers,
  ),
  Mutation: merge(
    OrderMutationResolvers
  ),
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
