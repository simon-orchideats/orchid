import { PlanQueryResolvers } from '../plans/planResolvers';
import { TestQueryResolver } from './testResolver';
import { merge } from 'lodash';
import { gql, makeExecutableSchema } from 'apollo-server';
import { PlanQL } from '../plans/plansQL';

const query = gql`
  type Query {
    test: String!
    availablePlans: [Plan!]!
  }
`

const gqlSchema = gql`
  schema {
    query: Query
  }
`

const typeDefs = [
  PlanQL,
  query,
  gqlSchema,
];

const resolvers = {
  Query: merge(
    TestQueryResolver,
    PlanQueryResolvers,
  ),
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
