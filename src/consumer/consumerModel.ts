import { IDestination, Destination, EDestination } from './../place/destinationModel';
import { ICard, Card } from './../card/cardModel';
import { EConsumerPlan, ConsumerPlan, IConsumerPlan, deliveryDay } from './consumerPlanModel';
import { CuisineTypes } from '../rest/mealModel';

export type Permission = 
  'update:allOrders'
  | 'read:allOrders'
  | 'update:rests	'
  | 'create:rests	'

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

export interface EConsumer {
  readonly createdDate: number,
  readonly plan: EConsumerPlan | null
  readonly profile: EConsumerProfile
  readonly stripeCustomerId: string | null
  readonly stripeSubscriptionId: string | null
}

export interface IConsumer extends Omit<EConsumer, 'createdDate' | 'profile' | 'plan'> {
  readonly _id: string
  readonly profile: IConsumerProfile
  readonly plan: IConsumerPlan | null
  readonly permissions: Permission[]
}

export class Consumer implements IConsumer {
  readonly _id: string
  readonly stripeCustomerId: string | null
  readonly stripeSubscriptionId: string | null
  readonly profile: ConsumerProfile
  readonly plan: ConsumerPlan | null
  readonly permissions: Permission[]

  constructor(consumer: IConsumer) {
    this._id = consumer._id
    this.stripeCustomerId = consumer.stripeCustomerId;
    this.stripeSubscriptionId = consumer.stripeSubscriptionId;
    this.profile = new ConsumerProfile(consumer.profile);
    this.plan = consumer.plan && new ConsumerPlan(consumer.plan);
    this.permissions = consumer.permissions.map(p => p);
  }

  public get StripeSubscriptionId() { return this.stripeSubscriptionId }
  public get StripeCustomerId() { return this.stripeCustomerId }
  public get Id() { return this._id }
  public get Permissions() { return this.permissions }
  public get Profile() { return this.profile }
  public get Plan() { return this.plan }

  static areCuisinesValid(cuisines: string[]) {
    for (let i = 0; i < cuisines.length; i++) {
      if (!Object.values<string>(CuisineTypes).includes(cuisines[i])) return false;
    }
    return true;
  }

  static getIConsumerFromEConsumer(_id: string, permissions: Permission[], eConsumer: EConsumer): IConsumer {
    return {
      _id,
      plan: eConsumer.plan,
      profile: eConsumer.profile,
      stripeCustomerId: eConsumer.stripeCustomerId,
      stripeSubscriptionId: eConsumer.stripeSubscriptionId,
      permissions: permissions.map(p => p),
    }
  }

  static getICopy(consumer: IConsumer): IConsumer {
    return {
      _id: consumer._id,
      stripeCustomerId: consumer.stripeCustomerId,
      stripeSubscriptionId: consumer.stripeSubscriptionId,
      profile: ConsumerProfile.getICopy(consumer.profile),
      plan: consumer.plan && ConsumerPlan.getICopy(consumer.plan),
      permissions: consumer.permissions.map(p => p),
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