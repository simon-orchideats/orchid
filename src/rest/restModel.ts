import { IAddress } from './../place/addressModel';
import { RestProfile, IRestProfile } from './restProfileModel';
import { IMeal, Meal, IMealInput } from './mealModel';
import { ELocation, Location, ILocation } from '../place/locationModel';
import { nanoid } from 'nanoid'

type RestStatus = 'Active' | 'Inactive'

export type OpeningDays = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const RestStatuses: {
  Active: 'Active',
  Inactive: 'Inactive'
} = {
  Active: 'Active',
  Inactive: 'Inactive'
}

export interface IDayHours {
  readonly open: string;
  readonly close: string;
}

export type OpeningDay = 'Su' | 'M' | 'T' | 'W' | 'Th' | 'F' | 'Sa';

export class DayHours implements IDayHours {
  readonly open: string;
  readonly close: string;

  constructor(dh: IDayHours) {
    this.open = dh.open;
    this.close = dh.close;
  }

  public get Open() { return this.open }
  public get Close() { return this.close }

  static getICopy(dh: IDayHours): IDayHours {
    return {
      open: dh.open,
      close: dh.close,
    }
  }
}

export interface IHours {
  readonly Su: IDayHours[]
  readonly M: IDayHours[]
  readonly T: IDayHours[]
  readonly W: IDayHours[]
  readonly Th: IDayHours[]
  readonly F: IDayHours[]
  readonly Sa: IDayHours[]
}

export class Hours implements IHours {
  readonly Su: DayHours[]
  readonly M: DayHours[]
  readonly T: DayHours[]
  readonly W: DayHours[]
  readonly Th: DayHours[]
  readonly F: DayHours[]
  readonly Sa: DayHours[]

  constructor(hs: IHours) {
    this.Su = hs.Su.map(dh => new DayHours(dh));
    this.M = hs.M.map(dh => new DayHours(dh));
    this.T = hs.T.map(dh => new DayHours(dh));
    this.W = hs.W.map(dh => new DayHours(dh));
    this.Th = hs.Th.map(dh => new DayHours(dh));
    this.F = hs.F.map(dh => new DayHours(dh));
    this.Sa = hs.Sa.map(dh => new DayHours(dh));
  }

  static getDay(i: OpeningDays): OpeningDay {
    switch (i) {
      case 0:
        return 'Su'
      case 1:
        return 'M'
      case 2:
        return 'T'
      case 3:
        return 'W'
      case 4:
        return 'Th'
      case 5:
        return 'F'
      case 6:
        return 'Sa'
      default:
        throw new Error(`Unexpected OpeningDay ${i}`)
    }
  }

  static getICopy(hs: IHours): IHours {
    return {
      Su: hs.Su.map(dh => DayHours.getICopy(dh)),
      M: hs.M.map(dh => DayHours.getICopy(dh)),
      T: hs.T.map(dh => DayHours.getICopy(dh)),
      W: hs.W.map(dh => DayHours.getICopy(dh)),
      Th: hs.Th.map(dh => DayHours.getICopy(dh)),
      F: hs.F.map(dh => DayHours.getICopy(dh)),
      Sa: hs.Sa.map(dh => DayHours.getICopy(dh)),
    }
  }
}


export interface ERest {
  readonly createdDate: number
  readonly location: ELocation
  readonly hours: IHours;
  readonly featured: IMeal[];
  readonly profile: IRestProfile;
  readonly taxRate: number;
  readonly deliveryFee: number;
  readonly status: RestStatus;
  readonly deliveryMinimum: number;
  readonly stripeRestId: string | null;
}

export interface IRestInput {
  readonly address: IAddress;
  readonly profile: IRestProfile;
  readonly featured: IMealInput[]
}

export interface IRest extends Omit<ERest, 'status' | 'createdDate' | 'location' | 'stripeRestId'> {
  readonly _id: string;
  readonly location: ILocation;
}

export class Rest {
  static getICopy(rest: IRest): IRest {
    return {
      _id: rest._id,
      deliveryMinimum: rest.deliveryMinimum,
      taxRate: rest.taxRate,
      deliveryFee: rest.deliveryFee,
      hours: Hours.getICopy(rest.hours),
      location: Location.getICopy(rest.location),
      featured: rest.featured.map(meal => Meal.getICopy(meal)),
      profile: RestProfile.getICopy(rest.profile),
    }
  }

  static getERestFromRestInput (
    rest: IRestInput,
    geo: {
      lat: string;
      lon: string;
      timezone: string;
    },
    // todo simon: these 3 args should be part of restinput
    deliveryFee: number,
    deliveryMinimum: number,
    taxRate: number,
  ): ERest {
    return {
      createdDate: Date.now(),
      deliveryFee,
      deliveryMinimum,
      location: {
        //todo pivot,
        primaryAddr: 'supsupsup',
        address2: null,
        geoPoint: {
          lat: geo.lat,
          lon: geo.lon,
        },
        timezone: geo.timezone
      },
      profile: {
        ...rest.profile
      },
      // todo simon, implement this
      hours: {
        Su: [],
        M: [],
        T: [],
        W: [],
        Th: [],
        F: [],
        Sa: []
      },
      taxRate,
      featured: rest.featured.map(m => Meal.getICopy({
        ...m,
        _id: nanoid(),
      })),
      status: RestStatuses.Inactive,
      stripeRestId: null,
    }
  }
}
