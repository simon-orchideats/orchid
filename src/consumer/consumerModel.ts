import { ILocation, Location, ELocation } from './../place/locationModel';
import { ICard, Card } from './../card/cardModel';
import { EConsumerPlan, ConsumerPlan, IConsumerPlan } from './consumerPlanModel';

export type Permission = 
  'update:allOrders'
  | 'read:allOrders'
  | 'update:rests'
  | 'create:rests'

export const Permissions: {
  updateAllOrders: 'update:allOrders'
  readAllOrders: 'read:allOrders'
  updateRests: 'update:rests'
  createRests: 'create:rests'
} = {
  updateAllOrders: 'update:allOrders',
  readAllOrders: 'read:allOrders',
  updateRests: 'update:rests',
  createRests: 'create:rests'
}

export interface IConsumerProfile {
  readonly name: string
  readonly email: string
  readonly phone: string | null
  readonly card: ICard | null
  readonly location: ILocation | null
  readonly serviceInstructions: string | null
}

export interface EConsumerProfile extends IConsumerProfile {
  readonly location: ELocation | null
}

export class ConsumerProfile {

  static getICopy(profile: IConsumerProfile): IConsumerProfile {
    return {
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      card: profile.card && Card.getICopy(profile.card),
      location: profile.location && Location.getICopy(profile.location),
      serviceInstructions: profile.serviceInstructions
    }
  }
}

export interface EConsumer {
  readonly createdDate: number,
  readonly plan: EConsumerPlan | null
  readonly profile: EConsumerProfile
  readonly stripeCustomerId: string | null
}

export interface IConsumer extends Omit<EConsumer, 'createdDate' | 'profile' | 'plan'> {
  readonly _id: string
  readonly profile: IConsumerProfile
  readonly plan: IConsumerPlan | null
  readonly permissions: Permission[]
}

export class Consumer {

  static getIConsumerFromEConsumer(_id: string, permissions: Permission[], eConsumer: EConsumer): IConsumer {
    return {
      _id,
      plan: eConsumer.plan,
      profile: eConsumer.profile,
      stripeCustomerId: eConsumer.stripeCustomerId,
      permissions: permissions.map(p => p),
    }
  }

  static getICopy(consumer: IConsumer): IConsumer {
    return {
      _id: consumer._id,
      stripeCustomerId: consumer.stripeCustomerId,
      profile: ConsumerProfile.getICopy(consumer.profile),
      plan: consumer.plan && ConsumerPlan.getICopy(consumer.plan),
      permissions: consumer.permissions.map(p => p),
    }
  }

}