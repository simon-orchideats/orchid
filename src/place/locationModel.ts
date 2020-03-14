import { IAddress, Address } from './addressModel';

export interface ILocation {
  readonly address: IAddress;
}

export class Location implements ILocation {
  readonly address: Address;

  constructor(location: ILocation) {
    this.address = new Address(location.address);
  }

  public get Address() { return this.address }

  static getICopy(location: ILocation): ILocation {
    return {
      address: Address.getICopy(location.address)
    }
  }
}
