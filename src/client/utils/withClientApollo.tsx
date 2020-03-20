import React from 'react'
import { ApolloProvider } from '@apollo/react-hooks'
import { initApolloClient } from './withPageApollo';
import { getContext } from '../../utils/apolloUtils';
// import { isServer } from './isServer';

/**
 * Creates and provides the apolloContext
 * to a component. Use it by wrapping
 * your component via HOC pattern.
 */
export default function withClientApollo<T>(Component: React.ComponentType<T>) {
  const WithClientApollo = (props: T) => {
    const client = initApolloClient(getContext(), {})
    return (
      <ApolloProvider client={client}>
        <Component {...props} />
      </ApolloProvider>
    )
  }

  // Set the correct displayName in development
  if (process.env.NODE_ENV !== 'production') {
    const displayName =
      Component.displayName || Component.name || 'Component'

    if (displayName === 'App') {
      console.warn('This withClientApollo HOC only works with vanilla components.')
    }

    WithClientApollo.displayName = `withClientApollo(${displayName})`
  }

  return WithClientApollo
}