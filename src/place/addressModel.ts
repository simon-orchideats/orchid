export type state =
''|
'AK'
| 'AL'
| 'AR'
| 'AZ'
| 'CA'
| 'CO'
| 'CT'
| 'DE'
| 'FL'
| 'GA'
| 'HI'
| 'IA'
| 'ID'
| 'IL'
| 'IN'
| 'KS'
| 'KY'
| 'LA'
| 'MA'
| 'MD'
| 'ME'
| 'MI'
| 'MN'
| 'MO'
| 'MS'
| 'MT'
| 'NC'
| 'ND'
| 'NE'
| 'NH'
| 'NJ'
| 'NM'
| 'NV'
| 'NY'
| 'OH'
| 'OK'
| 'OR'
| 'PA'
| 'RI'
| 'SC'
| 'SD'
| 'TN'
| 'TX'
| 'UT'
| 'VA'
| 'VT'
| 'WA'
| 'WI'
| 'WV'
| 'WY'

export interface IAddress {
  readonly address1: string
  readonly address2?: string
  readonly city: string
  readonly state: state
  readonly zip: string
}

export class Address implements IAddress {
  readonly address1: string
  readonly address2?: string
  readonly city: string
  readonly state: state
  readonly zip: string

  constructor(address: IAddress) {
    this.address1 = address.address1;
    this.address2 = address.address2;
    this.city = address.city;
    this.state = address.state;
    this.zip = address.zip;
  }
  
  public get Address1() { return this.address1 }
  public get Address2() { return this.address2 }
  public get City() { return this.city }
  public get State() { return this.state }
  public get Zip() { return this.zip }

  public getAddrStr() {
    return `${this.address1} ${this.address2 ? this.address2 + ' ' : ''}${this.city}, ${this.state} ${this.zip}`
  }

  static getICopy(addr: IAddress): IAddress {
    return {
      ...addr
    }
  }
}

type states = {
  AK: 'AK',
  AL: 'AL',
  AR: 'AR',
  AZ: 'AZ',
  CA: 'CA',
  CO: 'CO',
  CT: 'CT',
  DE: 'DE',
  FL: 'FL',
  GA: 'GA',
  HI: 'HI',
  IA: 'IA',
  ID: 'ID',
  IL: 'IL',
  IN: 'IN',
  KS: 'KS',
  KY: 'KY',
  LA: 'LA',
  MA: 'MA',
  MD: 'MD',
  ME: 'ME',
  MI: 'MI',
  MN: 'MN',
  MO: 'MO',
  MS: 'MS',
  MT: 'MT',
  NC: 'NC',
  ND: 'ND',
  NE: 'NE',
  NH: 'NH',
  NJ: 'NJ',
  NM: 'NM',
  NV: 'NV',
  NY: 'NY',
  OH: 'OH',
  OK: 'OK',
  OR: 'OR',
  PA: 'PA',
  RI: 'RI',
  SC: 'SC',
  SD: 'SD',
  TN: 'TN',
  TX: 'TX',
  UT: 'UT',
  VA: 'VA',
  VT: 'VT',
  WA: 'WA',
  WI: 'WI',
  WV: 'WV',
  WY: 'WY',
}

export const States: states = {
  AK: 'AK',
  AL: 'AL',
  AR: 'AR',
  AZ: 'AZ',
  CA: 'CA',
  CO: 'CO',
  CT: 'CT',
  DE: 'DE',
  FL: 'FL',
  GA: 'GA',
  HI: 'HI',
  IA: 'IA',
  ID: 'ID',
  IL: 'IL',
  IN: 'IN',
  KS: 'KS',
  KY: 'KY',
  LA: 'LA',
  MA: 'MA',
  MD: 'MD',
  ME: 'ME',
  MI: 'MI',
  MN: 'MN',
  MO: 'MO',
  MS: 'MS',
  MT: 'MT',
  NC: 'NC',
  ND: 'ND',
  NE: 'NE',
  NH: 'NH',
  NJ: 'NJ',
  NM: 'NM',
  NV: 'NV',
  NY: 'NY',
  OH: 'OH',
  OK: 'OK',
  OR: 'OR',
  PA: 'PA',
  RI: 'RI',
  SC: 'SC',
  SD: 'SD',
  TN: 'TN',
  TX: 'TX',
  UT: 'UT',
  VA: 'VA',
  VT: 'VT',
  WA: 'WA',
  WI: 'WI',
  WV: 'WV',
  WY: 'WY',
}