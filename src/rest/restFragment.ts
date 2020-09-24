import gql from 'graphql-tag';

const restFragment = gql`
  fragment restFragment on Rest {
    _id
    location {
      address {
        address1
        address2
        city
        state
        zip
      }
    }
    hours {
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
    featured {
      _id
      img
      name
      description
      tags {
        type
        name
      }
      isActive
      addonGroups {
        names
        limit
      }
      optionGroups {
        names
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