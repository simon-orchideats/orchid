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
    taxRate: Float!
    tags: [String!]!
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
    taxRate: Float!
    tags: [String!]!
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

  type Costs {
    tax: Float!
    tip: Float!
    mealPrices: [MealPrice!]!
    percentFee: Float
    flatRateFee: Float
    deliveryFee: Float!
  }

  type Order {
    _id: ID!
    invoiceDate: Float!
    deliveries: [Delivery!]!
    costs: Costs!
    phone: String!
    name: String!
    donationCount:Int!
    destination: Destination
    stripeInvoiceId: String
  }
`;


export const OrderQL = () => [
  _OrderQL,
]

