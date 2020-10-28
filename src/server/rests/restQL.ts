import { gql } from 'apollo-server';

const MealQL = gql`
  input OptionGroupInput {
    names: [String!]!
  }

  input AddonGroupInput {
    names: [String!]!
    limit: Int
  }

  input DiscountInput {
    description: String
    amountOff: Int
    percentOff: Int
  }

  type Choice {
    name: String!
    additionalPrice: Int!
  }

  type Discount {
    description: String
    amountOff: Int
    percentOff: Int
  }

  type OptionGroup {
    name: String
    options: [Choice!]!
  }

  type AddonGroup {
    addons: [Choice!]!
    name: String
    limit: Int
  }

  input TagInput {
    type: String
    name: String
  }

  input ComparisonInput {
    compareTo: String!
    percentOff: Int!
    serviceFeePercent: Int!
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

  type Comparison {
    compareTo: String!
    percentOff: Int!
    serviceFeePercent: Int!
  }

  type Meal {
    addonGroups: [AddonGroup!]!
    comparison: Comparison
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

  type WeekHours {
    Su: [DayHours!]!
    M: [DayHours!]!
    T: [DayHours!]!
    W: [DayHours!]!
    Th: [DayHours!]!
    F: [DayHours!]!
    Sa: [DayHours!]!
  }

  type Hours {
    name: ServiceType!
    weekHours: WeekHours!
  }

  input WeekHoursInput {
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
    hours: [Hours!]!
    location: Location!
    meta: String!
    featured: [Meal!]!
    profile: RestProfile!
    taxRate: Float!
    deliveryFee: Int!
    discount: Discount
  }
`;

export const RestQL = () => [
  _RestQL,
  MealQL,
  RestProfileQL,
]

