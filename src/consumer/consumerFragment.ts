import gql from 'graphql-tag';

export const consumerFragment = gql`
  fragment consumerFragment on Consumer {
    _id
    plan {
      role
      stripeProductPriceId
      stripeProductName
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
      serviceInstruction
    }
    permissions
  }
`