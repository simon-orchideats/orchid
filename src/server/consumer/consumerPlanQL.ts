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

const DeliveryTimeQL = gql`
  enum DeliveryTime {
    NineAToTenA
    TenAToElevenA
    ElevenAToTwelveP
    TwelvePToOneP
    OnePToTwoP
    TwoPToThreeP
    ThreePToFourP
    FourPToFiveP
    FivePToSixP
    SixPToSevenP
    SevenPToEightP
    EightPToNineP
    NinePToTenP
  }
`

const _ConsumerPlanQL = gql`
  type ConsumerPlan {
    stripePlanId: ID!
    deliveryDay: Int!
    deliveryTime: DeliveryTime!
    cuisines: [CuisineType!]!
  }

  input ConsumerPlanInput {
    stripePlanId: ID!
    deliveryDay: Int!
    deliveryTime: DeliveryTime!
    cuisines: [CuisineType!]!
  }
`

export const ConsumerPlanQL = () => [
  _ConsumerPlanQL,
  CuisineTypeQL,
  DeliveryTimeQL,
]