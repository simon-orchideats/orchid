import { LocationQL } from './../location/locationQL';
import { RestQueryResolvers } from './../rests/restResolvers';
import { RestQL } from './../rests/restQL';
import { PlanQueryResolvers } from '../plans/planResolvers';
import { TestQueryResolver } from './testResolver';
import { merge } from 'lodash';
import { gql, makeExecutableSchema } from 'apollo-server';
import { PlanQL } from '../plans/planQL';

const query = gql`
  type Query {
    test: String!
    availablePlans: [Plan!]!
    nearbyRests(zip: String): [Rest!]!
    rest(restId: ID!): Rest!
  }
`

const gqlSchema = gql`
  schema {
    query: Query
  }
`

const typeDefs = [
  LocationQL,
  PlanQL,
  RestQL,
  query,
  gqlSchema,
];

const resolvers = {
  Query: merge(
    TestQueryResolver,
    RestQueryResolvers,
    PlanQueryResolvers,
  ),
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
