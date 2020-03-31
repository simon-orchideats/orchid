import { gql } from 'apollo-server';

export const CartMealQL = gql`
  type CartMeal {
    mealId: ID!
    img: String
    name: String!
    quantity: Int!
  }

  input CartMealInput {
    mealId: ID!
    img: String
    name: String!
    quantity: Int!
  }
`

export const OrderStatus = gql`
  enum OrderStatus {
    Complete
    Confirmed
    Open
    Returned
    Skipped
  }
`

export const _OrderQL = gql`
  input CartInput {
    restId: ID # null for if cart is all donated
    consumerPlan: ConsumerPlanInput!
    paymentMethodId: String!
    card: CardInput!
    meals: [CartMealInput!]!
    phone: String!
    destination: DestinationInput!
    deliveryDate: Float!
    donationCount: Int!
  }
  input UpdateOrderInput {
    restId: ID # null for skip order
    meals: [CartMealInput!]!
    phone: String!
    destination: DestinationInput!
    deliveryDate: Float!
    deliveryTime: DeliveryTime!
    donationCount: Int!
    name: String!
  }
  type Order {
    _id: ID!
    deliveryDate: Float!
    deliveryTime: DeliveryTime!
    destination: Destination!
    mealPrice: Float
    meals: [CartMeal!]!
    phone: String!
    rest: Rest
    status: OrderStatus!
    name: String!
    donationCount:Int!
  }
`;


export const OrderQL = () => [
  CartMealQL,
  OrderStatus,
  _OrderQL,
]

