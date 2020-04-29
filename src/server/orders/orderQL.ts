import { gql } from 'apollo-server';

export const _OrderQL = gql`
  enum DeliveryStatus {
    Complete
    Confirmed
    Open
    Returned
    Skipped
  }

  input CartInput {
    card: CardInput!
    consumerPlan: ConsumerPlanInput!
    donationCount: Int!
    deliveries: [DeliveryInput!]!
    destination: DestinationInput!
    paymentMethodId: String!
    phone: String!
  }

  input CartMealInput {
    mealId: ID!
    img: String
    name: String!
    quantity: Int!
    stripePlanId: ID!
    planName: ID!
  }

  input DeliveryInput {
    deliveryTime: DeliveryTime!
    deliveryDate: Float!
    discount: Int
    meals: [DeliveryMealInput!]!
  }

  input DeliveryMealInput {
    mealId: ID!
    img: String
    name: String!
    quantity: Int!
    restId: ID!
    restName: String!
    stripePlanId: ID!
    planName: ID!
  }

  input UpdateDeliveryInput { 
    deliveries: [DeliveryInput!]!
    donationCount: Int!
  }

  type DeliveryMeal {
    mealId: ID!
    img: String
    name: String!
    quantity: Int!
    restId: ID!
    restName: String!
    stripePlanId: ID!
    planName: ID!
  }

  type Delivery {
    deliveryTime: DeliveryTime!
    deliveryDate: Float!
    discount: Int
    meals: [DeliveryMeal!]!
    status: DeliveryStatus!
  }

  type MealPrice {
    stripePlanId: ID!
    planName: ID!
    mealPrice: Float!
  }

  type Order {
    _id: ID!
    invoiceDate: Float!
    deliveries: [Delivery!]!
    mealPrices: [MealPrice!]!
    phone: String!
    name: String!
    donationCount:Int!
    destination: Destination
  }
`;


export const OrderQL = () => [
  _OrderQL,
]

