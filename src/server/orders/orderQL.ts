import { gql } from 'apollo-server';

export const _OrderQL = gql`

  enum ServiceType {
    Pickup
    Delivery
  }

  input CartRestInput {
    restId: ID!
    meals: [OrderMealInput!]!,
    restName: String!
    taxRate: Float!
    deliveryFee: Int!
  }

  input CartOrderInput {
    rest: CartRestInput!
    serviceDate: String!,
    serviceInstructions: String 
    serviceTime: String!
    serviceType: ServiceType!
  }

  input CartInput {
    address2: String
    paymentMethodId: ID!
    card: CardInput!
    stripeProductPriceId: ID
    phone: String!
    searchArea: String!
    cartOrder: CartOrderInput!
  }

  type OrderMeal {
    choices: [String!]!
    description: String
    img: String
    instructions: String
    mealId: ID!
    name: String!
    price: Int!
    quantity: Int!
  }

  input OrderMealInput {
    choices: [String!]!
    description: String
    img: String
    instructions: String
    mealId: ID!
    name: String!
    price: Int!
    quantity: Int!
    tags: [TagInput!]!
  }

  type Costs {
    taxRate: Float!
    tip: Int!
    deliveryFee: Int!
  }

  type OrderConsumerProfile {
    name: String!
    email: String!
    phone: String!
    card: Card!
  }

  type OrderConsumer {
    userId: ID!
    profile: OrderConsumerProfile!
  }

  type OrderRest {
    restId: ID!
    meals: [OrderMeal!]!,
    restName: String!
  }

  type Order {
    cartUpdatedDate: Float!
    consumer: OrderConsumer!
    costs: Costs!
    _id: ID!
    location: Location!
    rest: OrderRest
    serviceDate: String!
    serviceInstructions: String
    serviceTime: String!
    serviceType: ServiceType!
    stripePaymentId: String!
  }
`;


export const OrderQL = () => [
  _OrderQL,
]

