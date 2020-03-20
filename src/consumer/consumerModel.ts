import { IDestination, Destination } from './../place/destinationModel';
import { ICard, Card } from './../card/cardModel';

export interface IConsumerProfile {
  readonly name: string
  readonly email: string
  readonly phone: string | null
  readonly card: ICard | null
  readonly destination: IDestination | null
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
}

export type CuisineType =
  'American'
  | 'Bbq'
  | 'Chinese'
  | 'Indian'
  | 'Italian'
  | 'Japanese'
  | 'Mediterranean'
  | 'Mexican'
  | 'Thai'
  | 'Vegan'
  | 'Vegetarian'

export const CuisineTypes: {
  American: 'American',
  Bbq: 'Bbq',
  Chinese: 'Chinese',
  Indian: 'Indian',
  Italian: 'Italian',
  Japanese: 'Japanese',
  Mediterranean: 'Mediterranean',
  Mexican: 'Mexican',
  Thai: 'Thai',
  Vegan: 'Vegan',
  Vegetarian: 'Vegetarian'
} = {
  American: 'American',
  Bbq: 'Bbq',
  Chinese: 'Chinese',
  Indian: 'Indian',
  Italian: 'Italian',
  Japanese: 'Japanese',
  Mediterranean: 'Mediterranean',
  Mexican: 'Mexican',
  Thai: 'Thai',
  Vegan: 'Vegan',
  Vegetarian: 'Vegetarian'
}

export type RenewalType = 'Skip' | 'Auto';

export const RenewalTypes: {
  Skip: 'Skip',
  Auto: 'Auto'
} = {
  Skip: 'Skip',
  Auto: 'Auto',
}

export type deliveryDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface IConsumerPlan {
  readonly stripePlanId: string
  readonly deliveryDay: deliveryDay
  readonly renewal: RenewalType
  readonly cuisines: CuisineType[]
}

export class ConsumerPlan implements IConsumerPlan {
  readonly stripePlanId: string
  readonly deliveryDay: deliveryDay
  readonly renewal: RenewalType
  readonly cuisines: CuisineType[]

  constructor(consumerPlan: IConsumerPlan) {
    this.stripePlanId = consumerPlan.stripePlanId
    this.deliveryDay = consumerPlan.deliveryDay;
    this.renewal = consumerPlan.renewal;
    this.cuisines = consumerPlan.cuisines;
  }

  public get StripePlanId() { return this.stripePlanId }
  public get DeliveryDay() { return this.deliveryDay }
  public get Renewal() { return this.renewal }
  public get Cuisines() { return this.cuisines }
}

export interface EConsumer {
  readonly createdDate: number,
  readonly plan: IConsumerPlan
  readonly profile: IConsumerProfile
  readonly stripeCustomerId: string | null
  readonly stripeSubscriptionId: string | null
}

export interface IConsumer extends Omit<EConsumer, 'createdDate'> {
  readonly _id: string
}

export class Consumer implements IConsumer {
  readonly _id: string
  readonly stripeCustomerId: string | null
  readonly stripeSubscriptionId: string | null
  readonly profile: ConsumerProfile
  readonly plan: ConsumerPlan

  constructor(consumer: IConsumer) {
    this._id = consumer._id
    this.stripeCustomerId = consumer.stripeCustomerId;
    this.stripeSubscriptionId = consumer.stripeSubscriptionId;
    this.profile = new ConsumerProfile(consumer.profile);
    this.plan = new ConsumerPlan(consumer.plan)
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

  static isRenewalTypeValid(type: string) {
    return !!Object.values<string>(RenewalTypes).includes(type);
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