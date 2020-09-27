export interface IGeo {
  readonly lat: string,
  readonly lon: string,
}

export class Geo implements IGeo {
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

export interface ILocation {
  readonly primaryAddr: string
  readonly address2: string | null
}

export interface ELocation extends ILocation {
  readonly timezone: string;
  readonly geoPoint: IGeo
}

export class Location {
  static getICopy(l: ILocation): ILocation {
    return {
      primaryAddr: l.primaryAddr,
      address2: l.address2,
    }
  }
}
