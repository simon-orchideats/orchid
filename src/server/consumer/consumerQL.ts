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
  type ConsumerPlan {
    role: PlanRole!
    stripeProductPriceId: ID!
    stripeProductName: String!
  }
  type ConsumerLocation {
    primaryAddr: String!
    address2: String
    geoPoint: Geo!
  }
  input ConsumerLocationInput {
    primaryAddr: String!
    address2: String
    geoPoint: GeoInput!
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
    serviceInstruction: String
  }

  input ConsumerProfileInput {
    name: String!
    email: String!
    card: CardInput
    phone: String
    destination: ConsumerLocationInput
  }
`

export const ConsumerQL = () => [
  _ConsumerQL,
]