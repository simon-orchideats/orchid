import gql from 'graphql-tag';

const CartMealInputQL = gql`
  input CartMealInput {
    mealId: ID!
    name: String!
    quantity: Int!
  }
`

const _CartInputQL = gql`
  input CartInput {
    restId: ID!
    consumerPlan: ConsumerPlanInput!
    card: CardInput!
    meals: [CartMealInput!]!
    phone: String!
    destination: DestinationInput!
    deliveryDate: Float!
  }
`;

export const CartInputQL = () => [_CartInputQL, CartMealInputQL];
