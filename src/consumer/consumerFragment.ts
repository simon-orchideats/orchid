import gql from 'graphql-tag';

export const consumerFragment = gql`
  fragment consumerFragment on Consumer {
    _id
    stripeCustomerId
    stripeSubscriptionId
    plan {
      mealPlans {
        stripePlanId
        planName
        mealCount
      }
      schedule {
        day
        time
      }
      cuisines
    }
    profile {
      name
      email
      card {
        last4
        expMonth
        expYear
      }
      phone
      destination {
        instructions
        address {
          address1
          address2
          city
          state
          zip
        }
      }
    }
  }
`