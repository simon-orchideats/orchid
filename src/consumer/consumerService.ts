import { MutationBoolRes, MutationConsumerRes } from "./../utils/apolloUtils";
import { ApolloError } from 'apollo-client';
import { isServer } from './../client/utils/isServer';
import { consumerFragment } from './consumerFragment';
import { Consumer, IConsumer } from './consumerModel';
import gql from 'graphql-tag';
import { useQuery, useMutation, useLazyQuery } from '@apollo/react-hooks';
import { useMemo } from 'react';
import { activeConfig } from '../config';
import { ApolloCache, DataProxy } from 'apollo-cache';
import auth0 from 'auth0-js';
import { popupSocialAuthCB } from "../utils/auth";

const MY_CONSUMER_QUERY = gql`
  query myConsumer {
    myConsumer {
      ...consumerFragment
    }
  }
  ${consumerFragment}
`

export const useAddConsumerEmail = (): [
  (email: string) => void,
  {
    error?: ApolloError 
    data?: MutationBoolRes
  }
] => {
  type res = { insertEmail: MutationBoolRes };
  type vars = { email: string }
  const [mutate, mutation] = useMutation<res,vars>(gql`
    mutation insertEmail($email: String!) {
      insertEmail(email: $email) {
        res
        error
      }
    }
  `);
  const addConsumerEmail = (email: string) => {
    mutate({ variables: { email } })
  }
  return useMemo(() => [
    addConsumerEmail,
    {
      error: mutation.error,
      data: mutation.data ? mutation.data.insertEmail : undefined,
    }
  ], [mutation]);
}

type myConsumerRes = { myConsumer: IConsumer | null}

export const getMyConsumer = (cache: ApolloCache<any> | DataProxy) => cache.readQuery<myConsumerRes>({
  query: MY_CONSUMER_QUERY
});
export const updateMyConsumer = (cache: ApolloCache<any> | DataProxy, consumer: IConsumer) => {
  const newConsumer = copyWithTypenames(consumer);
  cache.writeQuery<myConsumerRes>({
    query: MY_CONSUMER_QUERY,
    data: {
      myConsumer: newConsumer
    }
  });
}

export const useUpdateConsumer = (): [
  (consumer: IConsumer) => void,
  {
    error?: ApolloError 
    data?: {
      res: Consumer | null,
      error: string | null
    }
  }
] => {
  type res = { updateConsumer: MutationConsumerRes };
  type vars = { consumer: IConsumer }
  const [mutate, mutation] = useMutation<res,vars>(gql`
    mutation updateConsumer($consumer: ConsumerInput) {
      updateConsumer(consumer: $consumer) {
        res {
          ...consumerFragment
        }
        error
      }
    }
    ${consumerFragment}
  `);
  const updateConsumer = (consumer: IConsumer) => {
    mutate({
      variables: { consumer },
      optimisticResponse: {
        updateConsumer: { 
          res: copyWithTypenames({
            _id: consumer._id,
            stripeSubscriptionId: consumer.stripeSubscriptionId,
            stripeCustomerId: consumer.stripeCustomerId,
            profile: consumer.profile,
            plan: consumer.plan,
          }),
          error: null,
          //@ts-ignore
          __typename: 'ConsumerRes'
        }
      }
    })
  }
  return useMemo(() => {
    const data = mutation.data && {
      res: mutation.data.updateConsumer.res && new Consumer(mutation.data.updateConsumer.res),
      error: mutation.data.updateConsumer.error
    }
    return [
      updateConsumer,
      {
        error: mutation.error,
        data,
      }
    ]
  }, [mutation]);
}


export const copyWithTypenames = (consumer: IConsumer): IConsumer => {
  const newConsumer = Consumer.getICopy(consumer);
  //@ts-ignore
  newConsumer.plan.__typename = 'ConsumerPlan';
  //@ts-ignore
  newConsumer.profile.__typename = 'ConsumerProfile';
  //@ts-ignore
  if (newConsumer.profile.card) newConsumer.profile.card.__typename = 'Card';
  //@ts-ignore
  if (newConsumer.profile.destination && newConsumer.profile.destination.address ) newConsumer.profile.destination.address.__typename  = 'Address'
  //@ts-ignore
  if (newConsumer.profile.destination) newConsumer.profile.destination.__typename = 'Destination'
  //@ts-ignore
  newConsumer.__typename = 'Consumer';
  //@ts-ignore
  if (newConsumer.profile.destination && !newConsumer.profile.destination.address.address2) newConsumer.profile.destination.address.address2 = null;
  return newConsumer
}

export const useRequireConsumer = (url: string) => {
  const res = useQuery<myConsumerRes>(MY_CONSUMER_QUERY);
  const consumer = useMemo<Consumer | null>(() => (
    res.data && res.data.myConsumer ? new Consumer(res.data.myConsumer) : null
  ), [res.data]);
  if (!consumer && !res.loading && !res.error) {
    if (!isServer()) window.location.assign(`${activeConfig.client.app.url}/login?redirect=${url}`);
    return {
      loading: res.loading,
      error: res.error,
      data: consumer
    }
  }
  return {
    loading: res.loading,
    error: res.error,
    data: consumer
  }
}

export const useGetConsumer = () => {
  const res = useQuery<myConsumerRes>(MY_CONSUMER_QUERY);
  const consumer = useMemo<Consumer | null>(() => (
    res.data && res.data.myConsumer ? new Consumer(res.data.myConsumer) : null
  ), [res.data]);
  return {
    loading: res.loading,
    error: res.error,
    data: consumer
  }
}

export const useGetLazyConsumer = (): [
  () => void,
  {
    error?: ApolloError 
    data: Consumer | null
  }
] => {
  const [getConsumer, consumerRes] = useLazyQuery<myConsumerRes>(MY_CONSUMER_QUERY, {
    fetchPolicy: 'network-only',
  });
  return [
    getConsumer,
    {
      error: consumerRes.error,
      data: consumerRes.data && consumerRes.data.myConsumer ? new Consumer(consumerRes.data.myConsumer) : null
    }
  ]
}

export const useSignIn = () =>
  (url: string = '/') => window.location.assign(`${activeConfig.client.app.url}/login?redirect=${url}`);

export const useGoogleSignIn = () => () => new Promise<{ name: string, email: string }>((resolve, reject) => {
  const webAuth = new auth0.WebAuth({
    domain: activeConfig.client.auth.domain,
    clientID: activeConfig.client.auth.clientId
  });
  webAuth.popup.authorize({
    domain: activeConfig.client.auth.domain,
    clientId: activeConfig.client.auth.clientId,
    audience: activeConfig.client.auth.audience,
    redirectUri: `${activeConfig.client.app.url}${popupSocialAuthCB}`,
    connection: 'google-oauth2',
    responseType: 'code',
    scope: 'openid profile email offline_access',
  }, (err: auth0.Auth0Error | null, res: any) => {
    if (err) {
      console.error(`Could not social auth. '${JSON.stringify(err)}'`);
      reject(err);
    }
    resolve({
      name: res.idTokenPayload.name,
      email: res.idTokenPayload.email,
    });
  });
})

export const useSignUp = (): [
  (email: string, name: string, pass: string) => void,
  {
    error?: ApolloError 
    data?: {
      res: Consumer | null,
      error: string | null
    }
  }
] => {
  type res = { signUp: MutationConsumerRes };
  type vars = { email: string, name: string, pass: string }
  const [mutate, mutation] = useMutation<res,vars>(gql`
    mutation signUp($email: String!, $name: String!, $pass: String!) {
      signUp(email: $email, name: $name, pass: $pass) {
        res {
          ...consumerFragment
        }
        error
      }
    }
    ${consumerFragment}
  `);
  const signUp = (email: string, name: string, pass: string) => {
    mutate({
      variables: { email, name, pass },
      update: (cache, { data }) => {
        if (data && data.signUp.res) {
          cache.writeQuery({
            query: MY_CONSUMER_QUERY,
            data: {
              myConsumer: data.signUp.res,
            }
          })
        }
      }
    })
  }
  return useMemo(() => {
    const data = mutation.data && {
      res: mutation.data.signUp.res && new Consumer(mutation.data.signUp.res),
      error: mutation.data.signUp.error
    }
    return [
      signUp,
      {
        error: mutation.error,
        data,
      }
    ]
  }, [mutation]);
}
