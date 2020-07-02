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
    originalPrice: Float
    optionGroups: [OptionGroupInput!]!
    addonGroups: [AddonGroupInput!]!
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
    location: Location!
    menu: [Meal!]!
    hours: Hours
    profile: RestProfile!
    taxRate: Float!
  }
`;

export const RestQL = () => [
  _RestQL,
  MealQL,
  RestProfileQL,
]

