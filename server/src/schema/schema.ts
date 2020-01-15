import { TestQueryResolver } from './testResolver';
import { merge } from 'lodash';
import { makeExecutableSchema } from 'apollo-server';

const query = `
  type Cart {
    plan: [String!]!
  }
  type Query {
    test: String!
  }
`

const gqlSchema = `
  schema {
    query: Query
  }
`

const typeDefs = [
  query,
  gqlSchema,
];

const resolvers = {
  Query: merge(
    TestQueryResolver,
  ),
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
