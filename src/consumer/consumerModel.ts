import { ILocation, Location } from './../location/locationModel';

interface IName {
  readonly firstName: string
  readonly lastName: string
}

export class Name implements IName {
  readonly firstName: string
  readonly lastName: string

  constructor(name: IName) {
    this.firstName = name.firstName;
    this.lastName = name.lastName;
  }

  public get FirstName() { return this.firstName }
  public get LastName() { return this.lastName }
}

interface ICard {
  readonly _id: string
  readonly last4: string
  readonly expMonth: number
  readonly expYear: number
}

export class Card implements ICard {
  readonly _id: string
  readonly last4: string
  readonly expMonth: number
  readonly expYear: number

  constructor(card: ICard) {
    this._id = card._id;
    this.last4 = card.last4;
    this.expMonth = card.expMonth;
    this.expYear = card.expYear;
  }

  public get Id() { return this._id };
  public get HiddenNumber() { return `**** ${this.Last4}`}
  public get Last4() { return this.last4 };
  public get ExpMonth() { return this.expMonth };
  public get ExpYear() { return this.expYear };
}

interface IDestination {
  readonly location: ILocation
  readonly instructions: string
}

export class Destination implements IDestination {
  readonly location: Location
  readonly instructions: string

  constructor(destination: IDestination) {
    this.location = new Location(destination.location);
    this.instructions = destination.instructions;
  }

  public get Location() { return this.location }
  public get Instructions() { return this.instructions }
}

interface IConsumerProfile {
  readonly name: IName
  readonly email: string
  readonly phone: string
  readonly card: ICard
  readonly destination: IDestination
}

export class ConsumerProfile implements IConsumerProfile {
  readonly name: Name
  readonly email: string
  readonly phone: string
  readonly card: Card
  readonly destination: Destination

  constructor(consumerProfile: IConsumerProfile) {
    this.name = new Name(consumerProfile.name);
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

interface IConsumerPlan {
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

interface IConsumer {
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