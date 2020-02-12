import gql from 'graphql-tag';

const _CardQL = gql`
  type Card {
    last4: String!
    expMonth: Int!
    expYear: Int!
  }

  input CardInput {
    last4: String!
    expMonth: Int!
    expYear: Int!
  }
`

export const CardQL = () => [_CardQL];
