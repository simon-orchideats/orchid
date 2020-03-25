import { gql } from 'apollo-server';

const destinationQL = gql`
  type Destination {
    address: Address!
    instructions: String
  }

  input DestinationInput {
    address: AddressInput!
    instructions: String
  }
`

export const DestinationQL = () => [
  destinationQL,
]