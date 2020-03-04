import { gql } from 'apollo-server';

const StateQL =  gql`
  enum State {
    AK
    AL
    AR
    AZ
    CA
    CO
    CT
    DE
    FL
    GA
    HI
    IA
    ID
    IL
    IN
    KS
    KY
    LA
    MA
    MD
    ME
    MI
    MN
    MO
    MS
    MT
    NC
    ND
    NE
    NH
    NJ
    NM
    NV
    NY
    OH
    OK
    OR
    PA
    RI
    SC
    SD
    TN
    TX
    UT
    VA
    VT
    WA
    WI
    WV
    WY
  }
`

const _AddressQL = gql`
  type Address {
    address1: String!
    address2: String
    city: String!
    state: State
    zip: String!
  }

  input AddressInput {
    address1: String!
    address2: String
    city: String!
    state: State!
    zip: String!
  }
`

export const AddressQL = () => [
  StateQL,
  _AddressQL,
]