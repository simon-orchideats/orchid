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

const AddressQL = gql`
  type Address {
    address1: String!
    address2: String
    city: String!
    state: State!
    zip: String!
  }
`

const LocationQL = gql`
  type Location {
    address: Address!
    timezone: String!
  }
`

const MealQL = gql`
  type Meal {
    _id: ID!
    img: String!
    name: String!
  }
`

const ProfileQL = gql`
  type Profile {
    name: String!
    phone: String!
  }
`

const _RestQL = gql`
  type Rest {
    _id: ID!
    location: Location!
    menu: [Meal!]!
    profile: Profile!
  }
`;

export const RestQL = () => [
  _RestQL,
  AddressQL,
  LocationQL,
  MealQL,
  ProfileQL,
  StateQL,
]

