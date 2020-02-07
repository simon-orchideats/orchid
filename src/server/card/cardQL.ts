import gql from 'graphql-tag';

const _CardQL = gql`
  type Card {
    _id: ID!
    last4: String!
    expMonth: Int!
    expYear: Int!
  }

  input CardInput {
    _id: ID!
    last4: String!
    expMonth: Int!
    expYear: Int!
  }
`

export const CardQL = () => [_CardQL];
