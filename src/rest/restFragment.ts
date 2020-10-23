import gql from 'graphql-tag';

const restFragment = gql`
  fragment restFragment on Rest {
    _id
    location {
      primaryAddr
      address2
    }
    discount {
      description
      amountOff
      percentOff
    }
    hours {
      name
      weekHours {
        Su {
          open
          close
        }
        M {
          open
          close
        }
        T {
          open
          close
        }
        W {
          open
          close
        }
        Th {
          open
          close
        }
        F {
          open
          close
        }
        Sa {
          open
          close
        }
      }
    }
    featured {
      _id
      img
      comparison {
        compareTo
        percentOff
        serviceFeePercent
        choice
      }
      name
      description
      tags {
        type
        name
      }
      isActive
      addonGroups {
        name
        limit
        addons {
          name
          additionalPrice
        }
      }
      optionGroups {
        name
        options {
          name
          additionalPrice
        }
      }
      price
    }
    profile {
      name
      phone
      actor
      actorImg
      story
    }
    taxRate
    deliveryFee
  }
`

export {
  restFragment,
}