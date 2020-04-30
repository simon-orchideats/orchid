import { gql } from 'apollo-server';

export const PlanQL = gql`
  enum PlanName {
    Standard
    Gourmet
  }
  type Tier {
    mealPrice: Int!
    minMeals: Int!
    maxMeals: Int
  }
  type Plan {
    name: PlanName!
    stripePlanId: ID!
    tiers: [Tier!]!
  }
`;