import { gql } from 'apollo-server';

const _LocationQL = gql`
  type Location {
    address: Address!
  }
`

export const LocationQL = () => [
  _LocationQL,
]