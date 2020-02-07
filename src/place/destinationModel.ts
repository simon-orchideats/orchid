import { IAddress, Address } from './addressModel';

export interface IDestination {
  readonly name: string
  readonly address: IAddress
  readonly phone: string
  readonly instructions: string
}

export class Destination implements IDestination {
  readonly name: string
  readonly address: Address
  readonly phone: string
  readonly instructions: string

  constructor(destination: IDestination) {
    this.name = destination.name;
    this.address = new Address(destination.address);
    this.instructions = destination.instructions;
    this.phone = destination.phone;
  }

  public get Address() { return this.address }
  public get Instructions() { return this.instructions }
  public get Name() { return this.name }
  public get Phone() { return this.phone }
}