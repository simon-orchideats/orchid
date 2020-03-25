import gql from 'graphql-tag';

const CuisineTypeQL = gql`
  enum CuisineType {
    American
    Bbq
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

const _ConsumerPlanQL = gql`
  type ConsumerPlan {
    stripePlanId: ID!
    deliveryDay: Int!
    cuisines: [CuisineType!]!
  }

  input ConsumerPlanInput {
    stripePlanId: ID!
    deliveryDay: Int!
    cuisines: [CuisineType!]!
  }
`

export const ConsumerPlanQL = () => [
  _ConsumerPlanQL,
  CuisineTypeQL,
]