import { gql } from 'apollo-server';

export const PlanQL = gql`
  type Plan {
    stripeId: ID!
    mealCount: Int!
    mealPrice: Float!
    weekPrice: Float!
  }
`;