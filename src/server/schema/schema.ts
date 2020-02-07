import { ConsumerPlanQL } from '../consumer/consumerPlanQL';
import { DestinationQL } from './../place/destinationQL';
import { AddressQL } from './../place/addressQL';
import { CardQL } from './../card/cardQL';
import { CartInputQL } from '../orders/cartInputQL';
import { LocationQL } from '../place/locationQL';
import { RestQueryResolvers } from './../rests/restResolvers';
import { RestQL } from './../rests/restQL';
import { PlanQueryResolvers } from '../plans/planResolvers';
import { merge } from 'lodash';
import { gql, makeExecutableSchema } from 'apollo-server';
import { PlanQL } from '../plans/planQL';
import { OrderMutationResolvers } from '../orders/orderResolvers';
import { ConsumerQL } from '../consumer/consumerQL';

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
