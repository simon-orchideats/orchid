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
    TenAToTwelveP
    TwelvePToTwoP
    TwoPToFourP
    FourPToSixP
    FivePToSevenP
    SixPToEightP
    SevenPToNineP
  }
`

const _ConsumerPlanQL = gql`
  input ScheduleInput {
    day: Int!
    time: DeliveryTime!
  }

  input MealPlanInput {
    stripePlanId: ID!
    planName: ID!
    mealCount: Int!
  }

  input ConsumerPlanInput {
    mealPlans: [MealPlanInput!]!
    schedules: [ScheduleInput!]!
    cuisines: [CuisineType!]!
  }

  type Schedule {
    day: Int!
    time: DeliveryTime!
  }

  type MealPlan {
    stripePlanId: ID!
    planName: ID!
    mealCount: Int!
  }

  type ConsumerPlan {
    mealPlans: [MealPlan!]!
    schedules: [Schedule!]!
    cuisines: [CuisineType!]!
  }
`

export const ConsumerPlanQL = () => [
  _ConsumerPlanQL,
  CuisineTypeQL,
  DeliveryTimeQL,
]