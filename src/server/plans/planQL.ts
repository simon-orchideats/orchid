import { gql } from 'apollo-server';

export const PlanQL = gql`
  enum PlanName {
    Foodie
    Partner
    Community
  }
  type Plan {
    stripeProductPriceId: ID!
    name: PlanName!
    numAccounts: Int!
    price: Int!
  }
`;