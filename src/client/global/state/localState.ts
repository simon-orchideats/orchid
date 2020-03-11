import { consumerQL } from './consumerState';
import { Resolvers } from 'apollo-client';
import { ApolloCache } from 'apollo-cache';
import {
  cartQL,
  cartMutationResolvers,
  cartInitialState,
} from './cartState';
import { notificationMutationResolvers, notificationQL, notificationInitialState } from './notificationState';

type Cache = { cache: ApolloCache<any> };

export type ClientResolver<A, R> = (
  parent: any, 
  args: A, 
  { cache } : Cache
) => R;

interface ResolverMap {
  [field: string]: ClientResolver<any, any>;
}

interface ClientResolvers extends Resolvers {
  Mutation: ResolverMap;
}

const clientResolvers: ClientResolvers = {
  Mutation: {
    ...cartMutationResolvers,
    ...notificationMutationResolvers,
  },
};

const clientInitialState = {
  cart: cartInitialState,
  notification: notificationInitialState,
}

const clientTypeDefs = [
  cartQL,
  notificationQL,
  consumerQL
]

export {
  clientTypeDefs,
  clientResolvers,
  clientInitialState,
}