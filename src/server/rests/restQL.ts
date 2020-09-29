import { gql } from 'apollo-server';

const MealQL = gql`
  input OptionGroupInput {
    names: [String!]!
  }

  input AddonGroupInput {
    names: [String!]!
    limit: Int
  }

  type OptionGroup {
    names: [String!]!
  }

  type AddonGroup {
    names: [String!]!
    limit: Int
  }

  input TagInput {
    type: String
    name: String
  }

  type Tag {
    type: String
    name: String
  }

  input MealInput {
    img: String!
    name: String!
    isActive: Boolean!
    description: String
    price: Float
    optionGroups: [OptionGroupInput!]!
    addonGroups: [AddonGroupInput!]!
    tags: [TagInput]
  }

  type Meal {
    addonGroups: [AddonGroup!]!
    description: String
    _id: ID!
    img: String
    isActive: Boolean!
    name: String!
    optionGroups: [OptionGroup!]!
    price: Int!
    tags: [Tag!]!
  }
`

const RestProfileQL = gql`
  input RestProfileInput {
    name: String!
    phone: String!
  }

  type RestProfile {
    name: String!
    phone: String!
    story: String
    actor: String
    actorImg: String
  }
`

const _RestQL = gql`
  enum ServiceDay {
    M
    T
    W
    Th
    F
    Sa
    Su
  }

  input DayHoursInput {
    open: String!
    close: String!
  }

  type DayHours {
    open: String!
    close: String!
  }

  type Hours {
    Su: [DayHours!]!
    M: [DayHours!]!
    T: [DayHours!]!
    W: [DayHours!]!
    Th: [DayHours!]!
    F: [DayHours!]!
    Sa: [DayHours!]!
  }

  input HoursInput {
    Su: [DayHoursInput!]!
    M: [DayHoursInput!]!
    T: [DayHoursInput!]!
    W: [DayHoursInput!]!
    Th: [DayHoursInput!]!
    F: [DayHoursInput!]!
    Sa: [DayHoursInput!]!
  }

  input RestInput {
    address: AddressInput!
    menu: [MealInput!]!
    profile: RestProfileInput!
  }

  type Rest {
    _id: ID!
    hours: Hours
    location: Location!
    featured: [Meal!]!
    profile: RestProfile!
    taxRate: Float!
    deliveryFee: Int!
  }
`;

export const RestQL = () => [
  _RestQL,
  MealQL,
  RestProfileQL,
]

