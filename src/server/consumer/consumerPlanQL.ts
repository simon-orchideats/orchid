import gql from 'graphql-tag';

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
    tags: [TagInput!]!
  }

  type Schedule {
    day: Int!
    time: DeliveryTime!
  }

  type WeeklyDiscount {
    discounts: [Discount!]!
  }

  type MealPlan {
    stripePlanId: ID!
    planName: ID!
    mealCount: Int!
  }

  type ConsumerPlan {
    mealPlans: [MealPlan!]!
    schedules: [Schedule!]!
    tags: [Tag!]!
    referralCode: String!
    weeklyDiscounts: [WeeklyDiscount!]!
  }
`

export const ConsumerPlanQL = () => [
  _ConsumerPlanQL,
  DeliveryTimeQL,
]