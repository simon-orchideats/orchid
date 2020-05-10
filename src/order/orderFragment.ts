import gql from 'graphql-tag';

const orderFragment = gql`
  fragment orderFragment on Order {
    _id
    invoiceDate
    destination {
      address {
        address1
        address2
        city
        state
        zip
      }
      instructions
    }
    costs {
      mealPrices {
        stripePlanId
        planName
        mealPrice
      }
    }
    deliveries {
      deliveryTime
      deliveryDate
      meals {
        mealId
        img
        name
        quantity
        restId
        restName
        stripePlanId
        planName
        taxRate
        tags
      }
      status
    }
    phone
    donationCount
    name
    stripeInvoiceId
  }
`

export {
  orderFragment,
}