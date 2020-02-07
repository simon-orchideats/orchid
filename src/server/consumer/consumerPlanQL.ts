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
    planId: ID!
    deliveryDay: Float
    renewal: RenewalType
    cuisines: [CuisineType!]
  }

  input ConsumerPlanInput {
    planId: ID!
    deliveryDay: Float
    renewal: RenewalType
    cuisines: [CuisineType!]
  }
`

export const ConsumerPlanQL = () => [
  _ConsumerPlanQL,
  CuisineTypeQL,
  RenewalTypeQL,
]