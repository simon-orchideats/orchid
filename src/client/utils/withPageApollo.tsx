/**
 * CAREFUL EDITING THIS FILE. TAKEN FROM
 * 
 * https://github.com/zeit/next.js/tree/canary/examples/with-typescript-graphql
 */

import { NextPage, NextPageContext } from 'next';
import React from 'react';
import Head from 'next/head';
import { ApolloProvider } from '@apollo/react-hooks';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { SchemaLink } from 'apollo-link-schema';
import { ApolloLink } from 'apollo-link';
import {
  clientTypeDefs,
  clientResolvers,
  clientInitialState
} from '../global/state/localState'
import { isServer } from './isServer';
import { getContext } from '../../server/utils/apolloUtils';

type TApolloClient = ApolloClient<NormalizedCacheObject>

type InitialProps = {
  apolloClient: TApolloClient
  apolloState: any
} & Record<string, any>

type WithApolloPageContext = {
  apolloClient: TApolloClient
} & NextPageContext

let globalApolloClient: TApolloClient

/**
 * Creates and provides the apolloContext
 * to a next.js PageTree. Use it by wrapping
 * your PageComponent via HOC pattern.
 */
export default function withApollo(
  PageComponent: NextPage,
  { ssr = true } = {}
) {
  const WithApollo = ({
    apolloClient,
    apolloState,
    ...pageProps
  }: InitialProps) => {
    const client = apolloClient || initApolloClient(apolloState)
    return (
      <ApolloProvider client={client}>
        <PageComponent {...pageProps} />
      </ApolloProvider>
    )
  }

  // Set the correct displayName in development
  if (process.env.NODE_ENV !== 'production') {
    const displayName =
      PageComponent.displayName || PageComponent.name || 'Component'

    if (displayName === 'App') {
      console.warn('This withApollo HOC only works with PageComponents.')
    }

    WithApollo.displayName = `withApollo(${displayName})`
  }

  if (ssr || PageComponent.getInitialProps) {
    WithApollo.getInitialProps = async (ctx: WithApolloPageContext) => {
      const { AppTree } = ctx

      // Initialize ApolloClient, add it to the ctx object so
      // we can use it in `PageComponent.getInitialProp`.
      const apolloClient = (ctx.apolloClient = initApolloClient(getContext(ctx.req)))

      // Run wrapped getInitialProps methods
      let pageProps = {}
      if (PageComponent.getInitialProps) {
        pageProps = await PageComponent.getInitialProps(ctx)
      }

      // Only on the server:
      if (isServer()) {
        // When redirecting, the response is finished.
        // No point in continuing to render
        if (ctx.res && ctx.res.finished) {
          return pageProps
        }

        // Only if ssr is enabled
        if (ssr) {
          try {
            // Run all GraphQL queries
            const { getDataFromTree } = await import('@apollo/react-ssr')
            await getDataFromTree(
              <AppTree
                pageProps={{
                  ...pageProps,
                  apolloClient,
                }}
              />
            )
          } catch (error) {
            // Prevent Apollo Client GraphQL errors from crashing SSR.
            // Handle them in components via the data.error prop:
            // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
            console.error('Error while running `getDataFromTree`', error)
          }

          // getDataFromTree does not call componentWillUnmount
          // head side effect therefore need to be cleared manually
          Head.rewind()
        }
      }

      // Extract query data from the Apollo store
      const apolloState = apolloClient.cache.extract()

      return {
        ...pageProps,
        apolloState,
      }
    }
  }

  return WithApollo
}

/**
 * Always creates a new apollo client on the server
 * Creates or reuses apollo client in the browser.
 * @param  {Object} initialState
 */
export function initApolloClient(ctx: object, initialState?: any) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (isServer()) {
    return createApolloClient(ctx, initialState)
  }

  // Reuse client on the client-side
  if (!globalApolloClient) {
    globalApolloClient = createApolloClient(ctx, initialState)
  }

  return globalApolloClient
}

/**
 * Creates and configures the ApolloClient
 * @param  {Object} [initialState={}]
 */
function createApolloClient(ctx = {}, initialState = {}) {
  const ssrMode = isServer();
  const cache = new InMemoryCache({
    cacheRedirects: {
      Query: {
        rest: (_root, { restId }, { getCacheKey }) => getCacheKey({ __typename: 'Rest', _id: restId })
      }
    }
  }).restore(initialState);
  cache.writeData({
    data: clientInitialState
  });
  // Check out https://github.com/zeit/next.js/pull/4611 if you want to use the AWSAppSyncClient
  return new ApolloClient({
    ssrMode,
    link: createIsomorphLink(ctx),
    cache,
    typeDefs: clientTypeDefs,
    resolvers: clientResolvers,
  })
}

function createIsomorphLink(context: object) {
  // can't do isServer() here, not sure why
  if (typeof window === 'undefined') {
    // not sure why i had to do import instead of require which the example...
    // const { SchemaLink } = require('./node_modules/apollo-link-schema')
    const schema = require('../../schema').schema
    return new SchemaLink({ schema, context })
  } else {
    // const { HttpLink } = require('./node_modules/apollo-link-http')
    const httpLink = new HttpLink({
      uri: '/api/graphql',
      credentials: 'same-origin',
    });
    const errorLink = onError(e => {
      const { graphQLErrors, networkError, operation } = e;
      const { variables, operationName } = operation;
      let msg = '';
      if (graphQLErrors) {
        graphQLErrors.forEach(({ message, path }) => {
          msg = msg + '\n' +`[GraphQL error]: Message: '${message}', Path: '${path}', variables: '${JSON.stringify(variables)}'`
        });
      }
  
      if (networkError) {
        msg = `[Network error]: '${networkError}', Operation: '${operationName}', variables: '${JSON.stringify(variables)}`;
      }
      
      console.error(JSON.stringify(e));
    });
    return ApolloLink.from([
      errorLink,
      httpLink,
    ])
  }
}
