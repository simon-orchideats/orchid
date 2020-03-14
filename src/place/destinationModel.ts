import { IAddress, Address } from './addressModel';

export interface IDestination {
  readonly name?: string
  readonly address: IAddress
  readonly instructions?: string
}

export class Destination implements IDestination {
  readonly name?: string
  readonly address: Address
  readonly instructions?: string

  constructor(destination: IDestination) {
    this.name = destination.name;
    this.address =destination.address && new Address(destination.address);
    this.instructions = destination.instructions;
  }

  public get Address() { return this.address }
  public get Instructions() { return this.instructions }
  public get Name() { return this.name }
}