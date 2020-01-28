type state =
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

}
