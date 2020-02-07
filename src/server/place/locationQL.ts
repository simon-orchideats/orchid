import { gql } from 'apollo-server';

const _LocationQL = gql`
  type Location {
    address: Address!
    timezone: String!
  }
`

export const LocationQL = () => [
  _LocationQL,
]