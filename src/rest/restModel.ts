import { deliveryDay, ISchedule } from './../consumer/consumerPlanModel';
import { PlanName } from './../plan/planModel';
import { IAddress } from './../place/addressModel';
import { RestProfile, IRestProfile } from './restProfileModel';
import { IMeal, Meal, IMealInput, AddonGroup, OptionGroup } from './mealModel';
import { ILocation, Location } from '../place/locationModel';
import { nanoid } from 'nanoid'

type RestStatus = 'Open' | 'Closed'

const RestStatuses: {
  Open: 'Open',
  Closed: 'Closed'
} = {
  Open: 'Open',
  Closed: 'Closed'
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

  static getDay(i: deliveryDay): OpeningDay {
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
        throw new Error(`Unexpected deliveryDay ${i}`)
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
  readonly location: ILocation & {
    geo?: {
      lat: string
      lon: string
    }
  };
  readonly hours: IHours;
  readonly menu: IMeal[];
  readonly profile: IRestProfile;
  readonly taxRate: number;
  readonly status: RestStatus
}

export interface IRestInput {
  readonly address: IAddress;
  readonly profile: IRestProfile;
  readonly menu: IMealInput[]
}

export interface IRest extends Omit<ERest, 'menu' | 'status' | 'createdDate'> {
  readonly _id: string;
  readonly menu: IMeal[];
}

export class Rest implements IRest {
  readonly _id: string;
  readonly hours: Hours;
  readonly location: Location;
  readonly menu: Meal[];
  readonly profile: RestProfile;
  readonly taxRate: number;

  constructor(rest: IRest) {
    this._id = rest._id
    this.hours = new Hours(rest.hours);
    this.location = new Location(rest.location);
    this.menu = rest.menu.map(meal => new Meal(meal));
    this.profile = new RestProfile(rest.profile)
    this.taxRate = rest.taxRate;
  }

  public get Id() { return this._id }
  public get Hours() { return this.hours }
  public get Location() { return this.location }
  public get Menu() { return this.menu }
  public get Profile() { return this.profile }
  public get TaxRate() { return this.taxRate }

  static getICopy(rest: IRest): IRest {
    return {
      ...rest,
      hours: Hours.getICopy(rest.hours),
      location: Location.getICopy(rest.location),
      menu: rest.menu.map(meal => Meal.getICopy(meal)),
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
    taxRate: number,
    planName: PlanName,
    stripePlanId: string,
  ): ERest {
    return {
      createdDate: Date.now(),
      location: {
        address: {
          ...rest.address,
          address2: rest.address.address2 ? rest.address.address2 : undefined
        },
        geo: {
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
      menu: rest.menu.map(m => ({
        ...m,
        optionGroups: m.optionGroups.map(og => OptionGroup.getICopy(og)),
        addonGroups: m.addonGroups.map(ag => AddonGroup.getICopy(ag)),
        _id: nanoid(),
        planName,
        stripePlanId,
      })),
      status: RestStatuses.Closed
    }
  }
}
