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
    }
    _id
    location {
      primaryAddr
      address2
    }
    rest {
      meals {
        choices
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