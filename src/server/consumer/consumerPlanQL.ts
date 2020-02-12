import gql from 'graphql-tag';

const CuisineTypeQL = gql`
  enum CuisineType {
    American
    BBQ
    Chinese
    Indian
    Italian
    Japanese
    Mediterranean
    Mexican
    Thai
    Vegan
    Vegetarian
  }
`

const RenewalTypeQL = gql`
  enum RenewalType {
    Skip
    Auto
  }
`

const _ConsumerPlanQL = gql`
  type ConsumerPlan {
    stripePlanId: ID!
    deliveryDay: Int!
    renewal: RenewalType
    cuisines: [CuisineType!]
  }

  input ConsumerPlanInput {
    stripePlanId: ID!
    deliveryDay: Int!
    renewal: RenewalType
    cuisines: [CuisineType!]
  }
`

export const ConsumerPlanQL = () => [
  _ConsumerPlanQL,
  CuisineTypeQL,
  RenewalTypeQL,
]