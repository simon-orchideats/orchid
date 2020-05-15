import { PlanName } from './../plan/planModel';
import { IDestination, Destination, EDestination } from './../place/destinationModel';
import { ICard, Card } from './../card/cardModel';
import moment from 'moment';

export const MIN_DAYS_AHEAD = 1;

export interface IConsumerProfile {
  readonly name: string
  readonly email: string
  readonly phone: string | null
  readonly card: ICard | null
  readonly destination: IDestination | null
}

export interface EConsumerProfile extends IConsumerProfile{
  readonly destination: EDestination | null
}

export class ConsumerProfile implements IConsumerProfile {
  readonly name: string
  readonly email: string
  readonly phone: string | null
  readonly card: Card | null
  readonly destination: Destination | null

  constructor(consumerProfile: IConsumerProfile) {
    this.name = consumerProfile.name;
    this.email = consumerProfile.email;
    this.phone = consumerProfile.phone;
    this.card = consumerProfile.card && new Card(consumerProfile.card);
    this.destination = consumerProfile.destination && new Destination(consumerProfile.destination);
  }

  public get Name() { return this.name }
  public get Email() { return this.email }
  public get Phone() { return this.phone }
  public get Card() { return this.card }
  public get Destination() { return this.destination }

  static getICopy(profile: IConsumerProfile): IConsumerProfile {
    return {
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      card: profile.card && Card.getICopy(profile.card),
      destination: profile.destination && Destination.getICopy(profile.destination),
    }
  }
}

export type CuisineType =
  'American'
  // | 'Bbq'
  | 'Chinese'
  | 'Indian'
  | 'Italian'
  | 'Japanese'
  | 'Mediterranean'
  | 'Mexican'
  // | 'Thai'
  // | 'Vegan'
  // | 'Vegetarian'

export const CuisineTypes: {
  American: 'American',
  // Bbq: 'Bbq',
  Chinese: 'Chinese',
  Indian: 'Indian',
  Italian: 'Italian',
  Japanese: 'Japanese',
  Mediterranean: 'Mediterranean',
  Mexican: 'Mexican',
  // Thai: 'Thai',
  // Vegan: 'Vegan',
  // Vegetarian: 'Vegetarian'
} = {
  American: 'American',
  // Bbq: 'Bbq',
  Chinese: 'Chinese',
  Indian: 'Indian',
  Italian: 'Italian',
  Japanese: 'Japanese',
  Mediterranean: 'Mediterranean',
  Mexican: 'Mexican',
  // Thai: 'Thai',
  // Vegan: 'Vegan',
  // Vegetarian: 'Vegetarian'
}

export type deliveryDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type deliveryTime =  'TenAToTwelveP' |
'TwelvePToTwoP' |
'TwoPToFourP' |
'FourPToSixP' |
'SixPToEightP'

const deliveryTimes: {
  TenAToTwelveP: '10am - 12pm',
  TwelvePToTwoP: '12pm - 2pm',
  TwoPToFourP: '2pm - 4pm',
  FourPToSixP: '4pm - 6pm',
  SixPToEightP: '6pm - 8pm',
} = {
  TenAToTwelveP: '10am - 12pm',
  TwelvePToTwoP: '12pm - 2pm',
  TwoPToFourP: '2pm - 4pm',
  FourPToSixP: '4pm - 6pm',
  SixPToEightP: '6pm - 8pm',
}

export const defaultDeliveryDay: deliveryDay = 2;
export const defaultDeliveryTime: deliveryTime = 'SixPToEightP';

export interface ISchedule {
  readonly day: deliveryDay;
  readonly time: deliveryTime;
}

export class Schedule implements ISchedule {
  readonly day: deliveryDay;
  readonly time: deliveryTime;

  constructor(s: ISchedule) {
    this.day = s.day;
    this.time = s.time;
  }

  public get Day() { return this.day }
  public get Time() { return this.time }

  static getICopy(s: ISchedule): ISchedule {
    return {
      ...s
    }
  }

  static getDateTimeStr(date: number, time: deliveryTime) {
    return `${moment(date).format('ddd M/D')}, ${ConsumerPlan.getDeliveryTimeStr(time)}`
  }

  static equals(s1: ISchedule, s2: ISchedule) {
    return s1.day === s2.day && s1.time === s2.time
  }

  static equalsLists(s1s: ISchedule[], s2s: ISchedule[]) {
    if (s1s.length !== s2s.length) return false;
    const s1sCopy = [...s1s];
    const s2sCopy = [...s2s];
    for (let i = 0; i < s1s.length; i++) {
      const findIndex = s2sCopy.findIndex(s2 => Schedule.equals(s1s[i], s2));
      if (findIndex === -1) return false;
      s2sCopy.slice(findIndex, 1);
    }
    for (let i = 0; i < s2s.length; i++) {
      const findIndex = s1sCopy.findIndex(s1 => Schedule.equals(s2s[i], s1));
      if (findIndex === -1) return false;
      s1sCopy.slice(findIndex, 1);
    }
    return true;
  }

  static getDefaultSchedule() {
    return new Schedule({
      day: defaultDeliveryDay,
      time: defaultDeliveryTime,
    })
  }
}

export interface IMealPlan {
  readonly stripePlanId: string;
  readonly planName: PlanName;
  readonly mealCount: number;
}

export class MealPlan implements IMealPlan {
  readonly stripePlanId: string;
  readonly planName: PlanName;
  readonly mealCount: number;

  constructor(plan: IMealPlan) {
    this.stripePlanId = plan.stripePlanId;
    this.planName = plan.planName;
    this.mealCount = plan.mealCount;
  }

  public get StripePlanId() { return this.stripePlanId }
  public get PlanName() { return this.planName }
  public get MealCount() { return this.mealCount }

  static getICopy(plan: IMealPlan): IMealPlan {
    return {
      ...plan
    }
  }

  static equals(p1: MealPlan, p2: MealPlan) {
    return p1.StripePlanId === p2.StripePlanId
      && p1.PlanName === p2.PlanName
      && p1.MealCount === p2.MealCount
  }

  static equalsLists(p1s: MealPlan[], p2s: MealPlan[]) {
    if (p1s.length !== p2s.length) return false;
    const p1Copy = [...p1s];
    const p2Copy = [...p2s];
    for (let i = 0; i < p1s.length; i++) {
      const findIndex = p2Copy.findIndex(p => MealPlan.equals(p1s[i], p));
      if (findIndex === -1) return false;
      p2Copy.slice(findIndex, 1);
    }
    for (let i = 0; i < p2s.length; i++) {
      const findIndex = p1Copy.findIndex(p => MealPlan.equals(p2s[i], p));
      if (findIndex === -1) return false;
      p1Copy.slice(findIndex, 1);
    }
    return true;
  }

  static getTotalCount(ps: IMealPlan[]) {
    return ps.reduce<number>((sum, p) => sum + p.mealCount, 0);
  }
}

export interface IConsumerPlan {
  readonly mealPlans: IMealPlan[]
  readonly cuisines: CuisineType[]
  readonly schedules: ISchedule[]
}

export class ConsumerPlan implements IConsumerPlan {
  readonly mealPlans: MealPlan[]
  readonly cuisines: CuisineType[]
  readonly schedules: Schedule[]

  constructor(consumerPlan: IConsumerPlan) {
    this.mealPlans = consumerPlan.mealPlans.map(p => new MealPlan(p));
    this.cuisines = consumerPlan.cuisines.map(c => c);
    this.schedules = consumerPlan.schedules.map(s => new Schedule(s));
  }

  public get Cuisines() { return this.cuisines }
  public get MealPlans() { return this.mealPlans }
  public get Schedules() { return this.schedules }

  static getICopy(plan: IConsumerPlan): IConsumerPlan {
    return {
      mealPlans: plan.mealPlans.map(p => MealPlan.getICopy(p)),
      schedules: plan.schedules.map(s => Schedule.getICopy(s)),
      cuisines: plan.cuisines.map(c => c),
    }
  }

  static getDeliveryTimeStr(deliveryTime: deliveryTime) {
    return deliveryTimes[deliveryTime];
  }

  static getDefaultDeliveryTime(): 'SixPToEightP' {
    return 'SixPToEightP';
  }

  static areCuisinesEqual(c1: CuisineType[], c2: CuisineType[]) {
    if (c1.length !== c2.length) return false;
    const c1Copy = [...c1];
    const c2Copy = [...c2];
    for (let i = 0; i < c1.length; i++) {
      const findIndex = c2Copy.findIndex(c => c1[i] === c);
      if (findIndex === -1) return false;
      c2Copy.slice(findIndex, 1);
    }
    for (let i = 0; i < c2.length; i++) {
      const findIndex = c1Copy.findIndex(c => c2[i] === c);
      if (findIndex === -1) return false;
      c1Copy.slice(findIndex, 1);
    }
    return true;
  }

  static equals(plan1: ConsumerPlan, plan2: ConsumerPlan) {
    if (!Schedule.equalsLists(plan1.Schedules, plan2.Schedules)) return false;
    if (!ConsumerPlan.areCuisinesEqual(plan1.Cuisines, plan2.Cuisines)) return false;
    if (!MealPlan.equalsLists(plan1.MealPlans, plan2.MealPlans)) return false;
    return true;
  }
}

export interface EConsumer {
  readonly createdDate: number,
  readonly plan: IConsumerPlan | null
  readonly profile: EConsumerProfile
  readonly stripeCustomerId: string | null
  readonly stripeSubscriptionId: string | null
}

export interface IConsumer extends Omit<EConsumer, 'createdDate' | 'profile'> {
  readonly _id: string
  readonly profile: IConsumerProfile
}

export class Consumer implements IConsumer {
  readonly _id: string
  readonly stripeCustomerId: string | null
  readonly stripeSubscriptionId: string | null
  readonly profile: ConsumerProfile
  readonly plan: ConsumerPlan | null

  constructor(consumer: IConsumer) {
    this._id = consumer._id
    this.stripeCustomerId = consumer.stripeCustomerId;
    this.stripeSubscriptionId = consumer.stripeSubscriptionId;
    this.profile = new ConsumerProfile(consumer.profile);
    this.plan = consumer.plan && new ConsumerPlan(consumer.plan);
  }

  public get StripeSubscriptionId() { return this.stripeSubscriptionId }
  public get StripeCustomerId() { return this.stripeCustomerId }
  public get Id() { return this._id }
  public get Profile() { return this.profile }
  public get Plan() { return this.plan }

  static areCuisinesValid(cuisines: string[]) {
    for (let i = 0; i < cuisines.length; i++) {
      if (!Object.values<string>(CuisineTypes).includes(cuisines[i])) return false;
    }
    return true;
  }

  static getIConsumerFromEConsumer(_id: string, econsumer: EConsumer): IConsumer {
    return {
      _id,
      plan: econsumer.plan,
      profile: econsumer.profile,
      stripeCustomerId: econsumer.stripeCustomerId,
      stripeSubscriptionId: econsumer.stripeSubscriptionId,
    }
  }

  static getICopy(consumer: IConsumer): IConsumer {
    return {
      _id: consumer._id,
      stripeCustomerId: consumer.stripeCustomerId,
      stripeSubscriptionId: consumer.stripeSubscriptionId,
      profile: ConsumerProfile.getICopy(consumer.profile),
      plan: consumer.plan && ConsumerPlan.getICopy(consumer.plan),
    }
  }

  static isDeliveryDayValid(d: number) {
    if (
      d === 0
      || d === 1
      || d === 2
      || d === 3
      || d === 4
      || d === 5
      || d === 6
    ) return true;
    return false;
  }

  static getWeekday(d: deliveryDay | null) {
    switch (d) {
      case 0: return 'Sunday'
      case 1: return 'Monday'
      case 2: return 'Tuesday'
      case 3: return 'Wednesday'
      case 4: return 'Thursday'
      case 5: return 'Friday'
      case 6: return 'Saturday'
      default:
        const err = new Error(`Invalid day '${d}'`);
        console.error(err.stack);
        throw err;
    }
  }

}