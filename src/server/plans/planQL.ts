import { gql } from 'apollo-server';

export const PlanQL = gql`
  enum PlanType {
    Standard
    Gourmet
  }
  type Tier {
    mealPrice: Int!
    minMeals: Int!
    maxMeals: Int
  }
  type Plan {
    type: PlanType!
    stripePlanId: ID!
    tiers: [Tier!]!
  }
`;