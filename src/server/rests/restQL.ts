import { gql } from 'apollo-server';

const CuisineTypeQL = gql`
  enum CuisineType {
    American
    # Bbq
    Chinese
    Cuban
    Indian
    Italian
    Japanese
    Korean
    Mediterranean
    Mexican
    Pescatarian
    Pizza
    Protein
    Seafood
    # Thai
    Vegan
    Vegetarian
  }
`

const MealQL = gql`
  type OptionGroup {
    names: [String!]!
  }

  type AddonGroup {
    names: [String!]!
    limit: Int
  }

  type Meal {
    _id: ID!
    img: String
    name: String!
    isActive: Boolean!
    description: String
    originalPrice: Float
    optionGroups: [OptionGroup!]!
    addonGroups: [AddonGroup!]!
    stripePlanId: ID!
    planName: ID!
    tags: [String!]!
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
  CuisineTypeQL,
  RestProfileQL,
]

