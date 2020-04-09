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
  }

  type DeliveryInput {
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
  }

  input UpdateOrderInput {
    deliveries: [DeliveryInput!]!
    donationCount: Int!
    name: String!
    phone: String!
  }

  type DeliveryMeal {
    mealId: ID!
    img: String
    name: String!
    quantity: Int!
    restId: ID!
    restName: String!
  }

  type Delivery {
    deliveryTime: DeliveryTime!
    deliveryDate: Float!
    discount: Int
    meals: [DeliveryMeal!]!
    status: DeliveryStatus!
  }

  type Order {
    _id: ID!
    deliveries: [Delivery!]!
    mealPrice: Float
    phone: String!
    name: String!
    donationCount:Int!
  }
`;


export const OrderQL = () => [
  _OrderQL,
]

