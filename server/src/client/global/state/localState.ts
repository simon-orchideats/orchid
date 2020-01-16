import { Resolvers } from 'apollo-client';
import { ApolloCache } from 'apollo-cache';
import {
  cartTypeDefs,
  cartMutationResolvers,
  cartInitialState,
} from './cart/cart';

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
    ...cartMutationResolvers
  },
};

const clientInitialState = {
  cart: cartInitialState
}

const clientTypeDefs = [
  cartTypeDefs,
]

export {
  clientTypeDefs,
  clientResolvers,
  clientInitialState,
}