import { ITag, Tag } from './tagModel';
import { ApolloCache, DataProxy } from 'apollo-cache';
import { IRest, Rest, IRestInput } from './restModel';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { restFragment } from './restFragment';
import { useMemo } from 'react';
import { MutationBoolRes } from '../utils/apolloUtils';
import { ApolloError } from 'apollo-client';
import { tagFragment } from './tagFragment';

export const useAddRest = (): [
  (rest: IRestInput) => void,
  {
    data?: MutationBoolRes
    error?: ApolloError 
  }
] => {
  type res = { addRest: MutationBoolRes };
  const [mutate, mutation] = useMutation<res>(gql`
    mutation addRest($rest: RestInput!) {
      addRest(rest: $rest) {
        res
        error
      }
    }
  `);
  const addRest = (rest: IRestInput) => {
    mutate({ 
      variables: { rest }
    })
  }
  return useMemo(() => [
    addRest,
    {
      error: mutation.error,
      data: mutation.data ? mutation.data.addRest : undefined,
    }
  ], [mutation]);
}

export const useGetTags = () => {
  type res = {
    allTags: ITag[]
  }
  const res = useQuery<res>(
    gql`
      query allTags {
        allTags {
          ...tagFragment
        }
      }
      ${tagFragment}
    `
  );

  const tags = useMemo<ITag[] | undefined>(() => (
    res.data ? res.data.allTags.map(t =>  Tag.getICopy(t)) : res.data
  ), [res.data]);

  return {
    loading: res.loading,
    error: res.error,
    data: tags
  }
}

const useGetNearbyRests = (addr: string) => {
  type res = {
    nearbyRests: IRest[]
  }
  const res = useQuery<res>(
    gql`
      query nearbyRests($addr: String) {
        nearbyRests(addr: $addr) {
          ...restFragment
        }
      }
      ${restFragment}
    `, 
    {
      skip: !addr,
      variables: { addr },
    }
  );

  const rests = useMemo<IRest[] | undefined>(() => (
    res.data ? res.data.nearbyRests.map(rest => Rest.getICopy(rest)) : res.data
  ), [res.data]);

  return {
    loading: res.loading,
    error: res.error,
    data: rests
  }
}

const GET_REST_QUERY = gql`
  query rest($restId: ID!) {
    rest(restId: $restId) {
      ...restFragment
    }
  }
  ${restFragment}
`;

type getRestQueryRes = { rest: IRest }

const getRest = (cache: ApolloCache<any> | DataProxy, restId: string) => cache.readQuery<getRestQueryRes>({
  query: GET_REST_QUERY,
  variables: { restId }
});

const useGetRest = (restId: string | null) => {
  const res = useQuery<getRestQueryRes>(
    GET_REST_QUERY, 
    {
      skip: !restId,
      variables: { restId },
    }
  );
  return {
    loading: res.loading,
    error: res.error,
    data: res.data ? Rest.getICopy(res.data.rest) : res.data
  }
}

export {
  useGetNearbyRests,
  useGetRest,
  getRest
}
