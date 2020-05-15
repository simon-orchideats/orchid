import { IAddress, Address } from './addressModel';

export interface IDestination {
  readonly address: IAddress
  readonly instructions: string | null
}

export class Destination implements IDestination {
  readonly address: Address
  readonly instructions: string | null

  constructor(destination: IDestination) {
    this.address = new Address(destination.address);
    this.instructions = destination.instructions;
  }

  public get Address() { return this.address }
  public get Instructions() { return this.instructions }

  static getICopy(dest: IDestination): IDestination {
    return {
      instructions: dest.instructions,
      address: Address.getICopy(dest.address)
    }
  }
}

export interface EDestination extends IDestination {
  readonly geo: {
    lat: string,
    lon: string,
  }
  timezone: {
    name: string,
    shortName: string,
  }
}