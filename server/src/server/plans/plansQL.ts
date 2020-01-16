import { gql } from 'apollo-server';

export const PlanQL = gql`
  type Plan {
    _id: ID!
    mealCount: Int!
    mealPrice: Float!
    weekPrice: Float!
  }
`;