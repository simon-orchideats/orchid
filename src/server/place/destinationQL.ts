import { gql } from 'apollo-server';

const destinationQL = gql`
  type Destination {
    name: String!
    location: Location!
    instructions: String!
  }

  input DestinationInput {
    name: String!
    address: AddressInput!
    instructions: String!
  }
`

export const DestinationQL = () => [
  destinationQL,
]