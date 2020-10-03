import gql from 'graphql-tag';

export const consumerFragment = gql`
  fragment consumerFragment on Consumer {
    _id
    plan {
      role
      stripeProductPriceId
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
      searchArea {
        primaryAddr
        address2
        geoPoint {
          lat
          lon
        }
      }
      serviceInstructions
    }
    permissions
  }
`