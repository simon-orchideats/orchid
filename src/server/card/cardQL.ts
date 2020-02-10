import gql from 'graphql-tag';

const _CardQL = gql`
  type Card {
    stripeCardId: ID!
    last4: String!
    expMonth: Int!
    expYear: Int!
  }

  input CardInput {
    stripeCardId: ID!
    last4: String!
    expMonth: Int!
    expYear: Int!
  }
`

export const CardQL = () => [_CardQL];
