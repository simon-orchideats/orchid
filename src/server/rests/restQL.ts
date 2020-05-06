import { gql } from 'apollo-server';

const MealQL = gql`
  type Meal {
    _id: ID!
    img: String
    name: String!
    description: String
    originalPrice: Float
    stripePlanId: ID!
    planName: ID!
  }
`

const RestProfileQL = gql`
  type RestProfile {
    name: String!
    phone: String!
  }
`

const _RestQL = gql`
  type Rest {
    _id: ID!
    location: Location!
    menu: [Meal!]!
    profile: RestProfile!
    taxRate: Float!
  }
`;

export const RestQL = () => [
  _RestQL,
  MealQL,
  RestProfileQL,
]

