import { ServiceTime, Order, ServiceType } from './../order/orderModel';
import { IAddress } from './../place/addressModel';
import { RestProfile, IRestProfile } from './restProfileModel';
import { IMeal, Meal, IMealInput } from './mealModel';
import { ELocation, Location, ILocation } from '../place/locationModel';
import { nanoid } from 'nanoid'
import { isWithinInterval } from 'date-fns';
import { IDiscount, Discount } from '../order/discountModel';

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

export type ServiceDay = 'Su' | 'M' | 'T' | 'W' | 'Th' | 'F' | 'Sa';

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

export interface IWeekHours {
  readonly Su: IDayHours[]
  readonly M: IDayHours[]
  readonly T: IDayHours[]
  readonly W: IDayHours[]
  readonly Th: IDayHours[]
  readonly F: IDayHours[]
  readonly Sa: IDayHours[]
}

export class WeekHours {

  static getServiceDay(serviceDate: string): ServiceDay {
    return WeekHours.getDay(new Date(Date.parse(serviceDate)).getDay() as OpeningDays)
  }

  static getDay(i: OpeningDays): ServiceDay {
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

  static getICopy(hs: IWeekHours): IWeekHours {
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

export interface IHours {
  readonly weekHours: IWeekHours
  readonly name: ServiceType
}

export class Hours {
  static getICopy(h: IHours): IHours {
    return {
      weekHours: WeekHours.getICopy(h.weekHours),
      name: h.name,
    }
  }
}


export interface ERest {
  readonly meta: string
  readonly createdDate: number
  readonly location: ELocation
  readonly hours: IHours[];
  readonly featured: IMeal[];
  readonly profile: IRestProfile;
  readonly taxRate: number;
  readonly deliveryFee: number;
  readonly status: RestStatus;
  readonly deliveryMinimum: number;
  readonly discount: IDiscount | null;
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
      discount: rest.discount ? Discount.getICopy(rest.discount) : null,
      meta: rest.meta,
      taxRate: rest.taxRate,
      deliveryFee: rest.deliveryFee,
      hours: rest.hours.map(h => Hours.getICopy(h)),
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
      discount: null,
      meta: 'supsupsup',
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
      hours: [],
      taxRate,
      featured: rest.featured.map(m => Meal.getICopy({
        ...m,
        _id: nanoid(),
      })),
      status: RestStatuses.Inactive,
      stripeRestId: null,
    }
  }

  static getRestFromERest(rest: ERest, restId: string ): IRest {
    return {
      meta: rest.meta,
      location: rest.location,
      hours: rest.hours,
      featured: rest.featured,
      profile: rest.profile,
      taxRate: rest.taxRate,
      deliveryFee: rest.deliveryFee,
      deliveryMinimum: rest.deliveryMinimum,
      discount: rest.discount ? Discount.getICopy(rest.discount) : null,
      _id: restId
    }
  }

  static isClosed(
    rest: IRest,
    serviceDate: string,
    serviceTime: ServiceTime,
    serviceType: ServiceType,
  ) {
    const serviceDay = WeekHours.getServiceDay(serviceDate);
    const fromTo = Order.get24HourStr(serviceTime);
    // arbituary year and month
    const defaultYear = 2000;
    const defaultMonth = 0;
    const defaultDay = 1;
    const fromSplit = fromTo.from.split(':');
    const toSplit = fromTo.to.split(':');
    const fromDate = new Date(
      defaultYear,
      defaultMonth,
      defaultDay,
      parseInt(fromSplit[0]),
      parseInt(fromSplit[1])
    );
    const toDate = new Date(
      defaultYear,
      defaultMonth,
      defaultDay,
      parseInt(toSplit[0]),
      parseInt(toSplit[1])
    );
    const hours = rest.hours.find(h => h.name === serviceType);
    if (!hours) return false;
    const weekHours = hours.weekHours[serviceDay];
    return !!!weekHours.find(h => {
      const openSplit = h.open.split(':');
      const closeSplit = h.close.split(':');
      const startDate = new Date(
        defaultYear,
        defaultMonth,
        defaultDay,
        parseInt(openSplit[0]),
        parseInt(openSplit[1])
      );
      const endDate = new Date(
        defaultYear,
        defaultMonth,
        defaultDay,
        parseInt(closeSplit[0]),
        parseInt(closeSplit[1])
      );
      return (
        isWithinInterval(
          fromDate,
          {
            start: startDate,
            end: endDate
          }
        ) && isWithinInterval(
          toDate,
          {
            start: startDate,
            end: endDate
          }
        )
      )
    })
  }

  static isEqual(r1: IRest, r2: IRest) {
    return r1._id === r2._id;
  }
}
