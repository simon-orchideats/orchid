import { IAddress, Address } from './addressModel';

export interface ILocation {
  readonly address: IAddress;
  readonly timezone: string;
}

export class Location implements ILocation {
  readonly address: Address;
  readonly timezone: string;

  constructor(location: ILocation) {
    this.address = new Address(location.address);
    this.timezone = location.timezone;
  }

  public get Address() { return this.address }
  public get Timezone() { return this.timezone }
}
