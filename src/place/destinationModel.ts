import { IAddress, Address } from './addressModel';

export interface IDestination {
  readonly name: string
  readonly address: IAddress
  readonly instructions: string | null
}

export class Destination implements IDestination {
  readonly name: string
  readonly address: Address
  readonly instructions: string | null

  constructor(destination: IDestination) {
    this.name = destination.name;
    this.address = new Address(destination.address);
    this.instructions = destination.instructions;
  }

  public get Address() { return this.address }
  public get Instructions() { return this.instructions }
  public get Name() { return this.name }

  static getICopy(dest: IDestination): IDestination {
    return {
      name: dest.name,
      instructions: dest.instructions,
      address: Address.getICopy(dest.address)
    }
  }
}