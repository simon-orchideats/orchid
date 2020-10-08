import gql from 'graphql-tag';

const orderFragment = gql`
  fragment orderFragment on Order {
    cartUpdatedDate
    consumer {
      userId
      profile {
        name
        email
        phone
        card {
          last4
          expMonth
          expYear
        }
      }
    }
    costs {
      taxRate
      tip
      deliveryFee
      discount {
        amountOff
        description
        percentOff
      }
    }
    _id
    location {
      primaryAddr
      address2
    }
    rest {
      meals {
        customizations {
          additionalPrice
          quantity
          name
        }
        description
        img
        instructions
        mealId
        name
        price
        quantity
      }
      restId
      restName
    }
    serviceDate
    serviceInstructions
    serviceTime
    serviceType
    stripePaymentId
  }
`

export {
  orderFragment,
}