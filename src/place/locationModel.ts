import { IAddress, Address } from './addressModel';

export interface IGeo {
  readonly lat: string,
  readonly lon: string,
}

export class Geo {
  readonly lat: string
  readonly lon: string

  constructor(geo: IGeo) {
    this.lat = geo.lat;
    this.lon = geo.lon;
  }

  static getICopy(geo: IGeo) {
    return {
      lat: geo.lat,
      lon: geo.lon,
    }
  }
}

export interface ELocation extends ILocation {
  readonly timezone: string;
  readonly geo: IGeo
}

export interface ILocation {
  readonly address: IAddress;
}

export class Location implements ILocation {
  readonly address: Address

  constructor(location: ILocation) {
    this.address = new Address(location.address);
  }

  static getICopy(location: ILocation): ILocation {
    return {
      address: Address.getICopy(location.address),
    }
  }
}
