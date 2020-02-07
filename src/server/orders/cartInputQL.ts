import gql from 'graphql-tag';

const MealInputQL = gql`
  input MealInput {
    _id: ID!
    img: String!
    name: String!
  }
`

const _CartInputQL = gql`
  input CartInput {
    restId: ID!
    consumerPlan: ConsumerPlanInput!
    card: CardInput!
    meals: [MealInput!]!
    destination: DestinationInput!
    deliveryDate: Float!
  }
`;

export const CartInputQL = () => [_CartInputQL, MealInputQL];
