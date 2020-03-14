import { RestProfile, IRestProfile } from './restProfileModel';
import { IMeal, Meal } from './mealModel';
import { ILocation, Location } from '../place/locationModel';

export interface ERest {
  readonly location: ILocation;
  readonly menu: IMeal[];
  readonly profile: IRestProfile;
}

export interface IRest extends ERest {
  readonly _id: string;
}

export class Rest implements IRest {
  readonly _id: string;
  readonly location: Location;
  readonly menu: Meal[];
  readonly profile: RestProfile;

  constructor(rest: IRest) {
    this._id = rest._id
    this.location = new Location(rest.location);
    this.menu = rest.menu.map(meal => new Meal(meal));
    this.profile = new RestProfile(rest.profile)
  }

  public get Id() { return this._id }
  public get Location() { return this.location }
  public get Menu() { return this.menu }
  public get Profile() { return this.profile }

  static getICopy(rest: IRest): IRest {
    return {
      ...rest,
      location: Location.getICopy(rest.location),
      menu: rest.menu.map(meal => Meal.getICopy(meal)),
      profile: RestProfile.getICopy(rest.profile),
    }
  }
}
