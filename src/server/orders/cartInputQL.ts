import gql from 'graphql-tag';

const CartMealInputQL = gql`
  input CartMealInput {
    mealId: ID!
    img: String!
    name: String!
    quantity: Int!
  }
`

const _CartInputQL = gql`
  input CartInput {
    restId: ID!
    consumerPlan: ConsumerPlanInput!
    paymentMethodId: String!
    card: CardInput!
    meals: [CartMealInput!]!
    phone: String!
    destination: DestinationInput!
    deliveryDate: Float!
  }
`;

export const CartInputQL = () => [_CartInputQL, CartMealInputQL];
