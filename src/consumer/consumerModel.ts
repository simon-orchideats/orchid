import { IDestination, Destination } from './../place/destinationModel';
import { ICard, Card } from './../card/cardModel';

export interface IConsumerProfile {
  readonly name: string
  readonly email: string
  readonly phone: string
  readonly card: ICard
  readonly destination: IDestination
}

export class ConsumerProfile implements IConsumerProfile {
  readonly name: string
  readonly email: string
  readonly phone: string
  readonly card: Card
  readonly destination: Destination

  constructor(consumerProfile: IConsumerProfile) {
    this.name = consumerProfile.name;
    this.email = consumerProfile.email;
    this.phone = consumerProfile.phone;
    this.card = new Card(consumerProfile.card);
    this.destination = new Destination(consumerProfile.destination);
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
  readonly planId: string
  readonly deliveryDay: deliveryDay
  readonly renewal: RenewalType
  readonly cuisines: CuisineType[]
}

export class ConsumerPlan implements IConsumerPlan {
  readonly planId: string
  readonly deliveryDay: deliveryDay
  readonly renewal: RenewalType
  readonly cuisines: CuisineType[]

  constructor(consumerPlan: IConsumerPlan) {
    this.planId = consumerPlan.planId
    this.deliveryDay = consumerPlan.deliveryDay;
    this.renewal = consumerPlan.renewal;
    this.cuisines = consumerPlan.cuisines;
  }

  public get PlanId() { return this.planId }
  public get DeliveryDay() { return this.deliveryDay }
  public get Renewal() { return this.renewal }
  public get Cuisines() { return this.cuisines }
}

export interface IConsumer {
  readonly profile?: IConsumerProfile
  readonly plan: IConsumerPlan
}

export class Consumer implements IConsumer {
  readonly profile?: ConsumerProfile
  readonly plan: ConsumerPlan

  constructor(consumer: IConsumer) {
    this.profile = consumer.profile && new ConsumerProfile(consumer.profile);
    this.plan = new ConsumerPlan(consumer.plan)
  }

  public get Profile() { return this.profile }
  public get Plan() { return this.plan }

}