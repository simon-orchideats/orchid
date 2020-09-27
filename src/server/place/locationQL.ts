import { gql } from 'apollo-server';

const _LocationQL = gql`
  type Location {
    primaryAddr: String!
    address2: String
  }

  input LocationInput {
    primaryAddr: String!
    address2: String
  }

  type Geo {
    lat: String!
    lon: String!
  }

  input GeoInput {
    lat: String!
    lon: String!
  }
`

export const LocationQL = () => [
  _LocationQL,
]