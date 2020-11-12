import { ApolloCache } from 'apollo-cache';
import { ClientResolver } from './localState';
import { NotificationType, Notification, INotification } from '../../notification/notificationModel';
import { useQuery, useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';

type notificationQueryRes = {
  notification: Notification | null
};

export const notificationQL = gql`
  enum NotificationType {
    success
    warning
    error
  }
  type Notification {
    message: String!
    type: NotificationType!
    doesAutoHide: Boolean!
  }
  extend type Query {
    notification: Notification!
  }
  extend type Mutation {
    clearNotification: Notification
    notify(message: String!, type: NotificationType!, doesAutoHide: Boolean!): Notification!
  }
`

export const notificationInitialState = null;
export const NOTIFICATION_QUERY = gql`
  query notification {
    notification @client
  }
`

export const useGetNotification = () => {
  const queryRes = useQuery<notificationQueryRes>(NOTIFICATION_QUERY);
  return queryRes.data ? queryRes.data.notification : null
}

export const useNotify = (): (message: string, type: NotificationType, doesAutoHide: boolean) => void => {
  const [mutate] = useMutation<any, INotification>(gql`
    mutation notify($message: String!, $type: NotificationType!, $doesAutoHide: Boolean!) {
      notify(message: $message, type: $type, doesAutoHide: $doesAutoHide) @client
    }
  `);
  return (message: string, type: NotificationType, doesAutoHide: boolean) => {
    mutate({ variables: { message, type, doesAutoHide } })
  }
}

export const useClearNotification = (): () => void => {
  const [mutate] = useMutation<any>(gql`
    mutation clearNotification {
      clearNotification @client
    }
  `);
  return () => {
    mutate()
  }
}

type notificationMutationResolvers = {
  clearNotification: ClientResolver<undefined, null>
  notify: ClientResolver<INotification, Notification>
}

const updateNotificationCache = (cache: ApolloCache<any>, notification: Notification | null) => {
  cache.writeQuery({
    query: NOTIFICATION_QUERY,
    data: { notification }
  });
  return notification;
}

export const notificationMutationResolvers: notificationMutationResolvers = {
  clearNotification: (_, _args, { cache }) => {
    updateNotificationCache(cache, null);
    return null;
  },

  notify: (_, {message, type, doesAutoHide }, { cache }) => {
    const notification = new Notification({
      message,
      type,
      doesAutoHide
    });
    updateNotificationCache(cache, notification);
    return notification;
  },
}
