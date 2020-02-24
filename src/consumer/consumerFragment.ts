import gql from 'graphql-tag';

export const consumerFragment = gql`
  fragment consumerFragment on Consumer {
    _id
    plan {
      stripePlanId
      deliveryDay
      renewal
      cuisines
    }
    card {
      last4
      expMonth
      expYear
    }
    phone
    destination {
      name
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
`