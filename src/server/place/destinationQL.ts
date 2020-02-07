import { gql } from 'apollo-server';

const destinationQL = gql`
  type Destination {
    name: String!
    location: Location!
    phone: String!
    instructions: String!
  }

  input DestinationInput {
    name: String!
    address: AddressInput!
    phone: String!
    instructions: String!
  }
`

export const DestinationQL = () => [
  destinationQL,
]