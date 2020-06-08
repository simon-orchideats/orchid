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

export interface ERest {
  readonly createdDate: number
  readonly location: ILocation & {
    geo?: {
      lat: string
      lon: string
    }
  };
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
  readonly location: Location;
  readonly menu: Meal[];
  readonly profile: RestProfile;
  readonly taxRate: number;

  constructor(rest: IRest) {
    this._id = rest._id
    this.location = new Location(rest.location);
    this.menu = rest.menu.map(meal => new Meal(meal));
    this.profile = new RestProfile(rest.profile)
    this.taxRate = rest.taxRate;
  }

  public get Id() { return this._id }
  public get Location() { return this.location }
  public get Menu() { return this.menu }
  public get Profile() { return this.profile }
  public get TaxRate() { return this.taxRate }

  static getICopy(rest: IRest): IRest {
    return {
      ...rest,
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
