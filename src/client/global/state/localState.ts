import { 
  consumerInitialState,
  consumerQL,
  consumerMutationResolvers,
 } from './consumerState';
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
    ...consumerMutationResolvers
  },
};

const clientInitialState = {
  cart: cartInitialState,
  notification: notificationInitialState,
  consumer: consumerInitialState,
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