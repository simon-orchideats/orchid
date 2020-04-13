import gql from 'graphql-tag';

const CuisineTypeQL = gql`
  enum CuisineType {
    American
    # Bbq
    Chinese
    Indian
    Italian
    Japanese
    Mediterranean
    Mexican
    # Thai
    # Vegan
    # Vegetarian
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
  input ScheduleInput {
    day: Int!
    time: DeliveryTime!
  }

  input ConsumerPlanInput {
    schedule: [ScheduleInput!]!
    cuisines: [CuisineType!]!
  }

  type Schedule {
    day: Int!
    time: DeliveryTime!
  }

  type ConsumerPlan {
    schedule: [Schedule!]!
    cuisines: [CuisineType!]!
  }
`

export const ConsumerPlanQL = () => [
  _ConsumerPlanQL,
  CuisineTypeQL,
  DeliveryTimeQL,
]