import gql from 'graphql-tag';

const _ConsumerQL = gql`
  type ConsumerRes {
    res: Consumer
    error: String
  }
  enum PlanRole {
    Member
    Owner
  }
  input ConsumerLocationInput {
    primaryAddr: String!
    address2: String
    geoPoint: GeoInput
  }
  input ConsumerProfileInput {
    name: String!
    email: String!
    card: CardInput!
    phone: String!
    serviceInstructions: String!
    searchArea: ConsumerLocationInput!
  }
  type ConsumerPlan {
    role: PlanRole!
    stripeProductPriceId: ID!
  }
  type ConsumerLocation {
    primaryAddr: String!
    address2: String
    geoPoint: Geo!
  }
  type Consumer {
    _id: ID!
    profile: ConsumerProfile!
    plan: ConsumerPlan
    permissions: [String!]!
  }
  type ConsumerProfile {
    name: String!
    email: String!
    card: Card
    phone: String
    searchArea: ConsumerLocation
    serviceInstructions: String
  }
`

export const ConsumerQL = () => [
  _ConsumerQL,
]