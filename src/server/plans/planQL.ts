import { gql } from 'apollo-server';

export const PlanQL = gql`
  type Plan {
    mealPrice: Int!
    minMeals: Int!
    maxMeals: Int!
  }
`;