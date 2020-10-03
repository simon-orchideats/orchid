import { MutationBoolRes, MutationConsumerRes } from "./../utils/apolloUtils";
import { ApolloError } from 'apollo-client';
import { isServer } from './../client/utils/isServer';
import { consumerFragment } from './consumerFragment';
import { Consumer, IConsumer, IConsumerProfileInput } from './consumerModel';
import gql from 'graphql-tag';
import { useQuery, useMutation, useLazyQuery } from '@apollo/react-hooks';
import { useMemo } from 'react';
import { activeConfig } from '../config';
import { ApolloCache, DataProxy } from 'apollo-cache';
import auth0 from 'auth0-js';
import { popupSocialAuthCB } from "../utils/auth";
import { IConsumerPlan, ConsumerPlan } from "./consumerPlanModel";

const MY_CONSUMER_QUERY = gql`
  query myConsumer {
    myConsumer {
      ...consumerFragment
    }
  }
  ${consumerFragment}
`
type myConsumerRes = { myConsumer: IConsumer | null }

export const copyWithTypenames = (consumer: IConsumer): IConsumer => {
  const newConsumer = Consumer.getICopy(consumer);
  if (newConsumer.plan) {
    //@ts-ignore
    newConsumer.plan.__typename = 'ConsumerPlan';
  }
  //@ts-ignore
  newConsumer.profile.__typename = 'ConsumerProfile';
  //@ts-ignore
  newConsumer.profile.card.__typename = 'Card';
  //@ts-ignore
  newConsumer.profile.searchArea.geoPoint.__typename  = 'Geo'
  //@ts-ignore
  newConsumer.profile.searchArea.__typename = 'ConsumerLocation'
  //@ts-ignore
  newConsumer.__typename = 'Consumer';
  //@ts-ignore
  if (!newConsumer.profile.searchArea.address2) newConsumer.profile.searchArea.address2 = null;
  return newConsumer
}

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

export const useUpdateMyProfile = (): [
  (consumer: IConsumer, profile: IConsumerProfileInput, paymentMethodId?: string) => void,
  {
    error?: ApolloError 
    data?: {
      res: IConsumer | null,
      error: string | null
    }
  }
] => {
  type res = { updateMyProfile: MutationConsumerRes };
  type vars = { profile: IConsumerProfileInput, paymentMethodId?: string }
  const [mutate, mutation] = useMutation<res,vars>(gql`
    mutation updateMyProfile($profile: ConsumerProfileInput!, $paymentMethodId: String) {
      updateMyProfile(profile: $profile, paymentMethodId: $paymentMethodId) {
        res {
          ...consumerFragment
        }
        error
      }
    }
    ${consumerFragment}
  `);
  const updateMyProfile = (consumer: IConsumer, profile: IConsumerProfileInput, paymentMethodId?: string) => {
    mutate({
      variables: { profile, paymentMethodId },
      optimisticResponse: {
        updateMyProfile: { 
          res: copyWithTypenames({
            ...consumer,
            profile: {
              ...profile,
              searchArea: profile.searchArea ?
                {
                  ...profile.searchArea,
                  // set to 0 temporarily
                  geoPoint: {
                    lat: '0',
                    lon: '0'
                  }
                }
                :
                null
            } 
          }),
          error: null,
          //@ts-ignore
          __typename: 'ConsumerRes'
        }
      },
      // refetchQueries: () => [{ query: MY_UPCOMING_ORDERS_QUERY }],
    })
  }
  return useMemo(() => {
    const data = mutation.data && {
      res: mutation.data.updateMyProfile.res,
      error: mutation.data.updateMyProfile.error
    }
    return [
      updateMyProfile,
      {
        error: mutation.error,
        data,
      }
    ]
  }, [mutation]);
}

export const useCancelSubscription = (): [
  () => void,
  {
    error?: ApolloError 
    data?: MutationBoolRes
  }
] => {
  type res = { cancelSubscription: MutationBoolRes };
  const [mutate, mutation] = useMutation<res>(gql`
    mutation cancelSubscription {
      cancelSubscription {
        res
        error
      }
    }
  `);
  const cancelSubscription = () => {
    mutate({
      optimisticResponse: {
        cancelSubscription: {
          res: true,
          error: null,
          //@ts-ignore
          __typename: "BoolRes",
        }
      },
      update: (cache, { data }) => {
        if (data && data.cancelSubscription.res) {
          const consumer = getMyConsumer(cache);
          if (!consumer || !consumer.myConsumer) {
            const err = new Error('No consumer found');
            console.error(err.stack);
            throw err;
          }
          const newConsumer = copyWithTypenames(consumer.myConsumer);
          updateMyConsumer(cache, {
            ...newConsumer,
            plan: null,
          });
        }
      },
      // refetchQueries: () => [{ query: MY_UPCOMING_ORDERS_QUERY }],
    })
  }
  return useMemo(() => [
    cancelSubscription,
    {
      error: mutation.error,
      data: mutation.data ? mutation.data.cancelSubscription : undefined,
    }
  ], [mutation]);
}

export const useGetConsumer = () => {
  const res = useQuery<myConsumerRes>(MY_CONSUMER_QUERY);
  const consumer = useMemo<IConsumer | null>(() => (
    res.data && res.data.myConsumer ? Consumer.getICopy(res.data.myConsumer) : null
  ), [res.data]);
  return {
    loading: res.loading,
    error: res.error,
    data: consumer
  }
}

export const useGetConsumerFromPromo = (promoCode: string) => {
  type consumerFromReferral = { consumerFromReferral: string }
  const res = useQuery<consumerFromReferral>(gql`
      query consumerFromReferral($promoCode: ID!) {
        consumerFromReferral(promoCode: $promoCode)
      }
    `, 
    {
      skip: !promoCode,
      variables: { promoCode },
    }
  );
  return {
    loading: res.loading,
    error: res.error,
    name: res.data?.consumerFromReferral,
  }
}

export const useGetLazyConsumer = (): [
  () => void,
  {
    error?: ApolloError 
    data: IConsumer | null
  }
] => {
  const [getConsumer, consumerRes] = useLazyQuery<myConsumerRes>(MY_CONSUMER_QUERY, {
    fetchPolicy: 'network-only',
  });
  return [
    getConsumer,
    {
      error: consumerRes.error,
      data: consumerRes.data ? consumerRes.data.myConsumer : null
    }
  ]
}

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
      return;
    }
    resolve({
      name: res.idTokenPayload.name,
      email: res.idTokenPayload.email,
    });
  });
})

export const useRequireConsumer = (url: string) => {
  const res = useQuery<myConsumerRes>(MY_CONSUMER_QUERY);
  const consumer = useMemo<IConsumer | null>(() => (
    res.data && res.data.myConsumer ? Consumer.getICopy(res.data.myConsumer) : null
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

export const useSignIn = () =>
  (url: string = '/') => window.location.assign(`${activeConfig.client.app.url}/login?redirect=${url}`);

export const useConsumerSignUp = (): [
  (email: string, name: string, pass: string) => void,
  {
    error?: ApolloError 
    data?: {
      res: IConsumer | null,
      error: string | null
    }
    called: boolean,
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
      res: mutation.data.signUp.res,
      error: mutation.data.signUp.error
    }
    return [
      signUp,
      {
        error: mutation.error,
        data,
        called: mutation.called
      }
    ]
  }, [mutation]);
}

export const useUpdateMyPlan = (): [
  (plan: IConsumerPlan, currConsumer: IConsumer) => void,
  {
    error?: ApolloError 
    data?: {
      res: IConsumer | null,
      error: string | null
    }
  }
] => {
  type res = { updateMyPlan: MutationConsumerRes };
  const [mutate, mutation] = useMutation<res>(gql`
    mutation updateMyPlan($plan: ConsumerPlanInput!) {
      updateMyPlan(plan: $plan) {
        res {
          ...consumerFragment
        }
        error
      }
    }
    ${consumerFragment}
  `);
  const updateMyPlan = (plan: IConsumerPlan, currConsumer: IConsumer) => {
    if (!currConsumer.plan) {
      const err = new Error('Missing consumer plan');
      console.error(err.stack);
      throw err;
    }
    if (ConsumerPlan.equals(plan, currConsumer.plan)) return;
    mutate({ 
      variables: {
        plan,
      },
      optimisticResponse: {
        updateMyPlan: {
          res: copyWithTypenames({
            ...currConsumer,
            plan
          }),
          error: null,
          //@ts-ignore
          __typename: 'ConsumerRes'
        }
      },
      // refetchQueries: () => [{ query: MY_UPCOMING_ORDERS_QUERY }],
    })
  }
  return useMemo(() => {
    const data = mutation.data && {
      res: mutation.data.updateMyPlan.res && Consumer.getICopy(mutation.data.updateMyPlan.res),
      error: mutation.data.updateMyPlan.error
    }
    return [
      updateMyPlan,
      {
        error: mutation.error,
        data,
      }
    ]
  }, [mutation]);
}