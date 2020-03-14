import gql from 'graphql-tag';

const _ConsumerQL = gql`
  type Consumer {
    _id: ID!
    plan: ConsumerPlan
    profile: ConsumerProfile!
  }
  type ConsumerProfile {
    name: String
    email: String!
    card: Card
    phone: String
    destination: Destination
  }
`

export const ConsumerQL = () => [
  _ConsumerQL,
]