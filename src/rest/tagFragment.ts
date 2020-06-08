import gql from 'graphql-tag';

const tagFragment = gql`
  fragment tagFragment on Tag {
    type
    name
  }
`

export {
  tagFragment,
}