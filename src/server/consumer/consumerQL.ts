import gql from 'graphql-tag';

const _ConsumerQL = gql`
  type ConsumerRes {
    res: Consumer
    error: String
  }
  type Consumer {
    _id: ID!
    plan: ConsumerPlan
    profile: ConsumerProfile!
    stripeCustomerId: ID
    stripeSubscriptionId: ID
  }
  type ConsumerProfile {
    name: String!
    email: String!
    card: Card
    phone: String
    destination: Destination
  }
  input ConsumerInput {
    _id: ID!
    stripeCustomerId: ID
    stripeSubscriptionId: ID
    profile: ConsumerProfileInput!
    plan: ConsumerPlanInput
  }
  input ConsumerProfileInput {
    name: String!
    email: String!
    card: CardInput
    phone: String
    destination: DestinationInput
  }
`

export const ConsumerQL = () => [
  _ConsumerQL,
]