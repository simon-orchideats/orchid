import { IConsumerProfile } from './../consumer/consumerModel';
import { ICost } from './costModel';
import { ICartInput, ICartMealInput } from './cartModel';

export interface EOrder {
  readonly cartUpdatedDate: number
  readonly consumer: {
    readonly userId: string
    readonly profile: IConsumerProfile
  },
  readonly costs: ICost
  readonly createdDate: number
  readonly deliveryDate: number
  readonly rest: {
    readonly restId: string
    readonly meals: ICartMealInput[]
  }
  readonly status: 'Complete' | 'Confirmed' | 'Pending' | 'Returned'
  readonly stripeSubscriptionId: string
}

export interface IOrder extends EOrder {
  readonly _id: string
}

export class Order {
  static getNewOrderFromCartInput(signedInUser: any, cart: ICartInput, subscriptionId: string): EOrder {
    const now = Date.now();
    return {
      rest: {
        restId: cart.restId,
        meals: cart.meals,
      },
      status: 'Pending',
      consumer: {
        userId: signedInUser.userId,
        profile: {
          name: signedInUser.name,
          email: signedInUser.email,
          phone: cart.phone,
          card: cart.card,
          destination: cart.destination,
        }
      },
      stripeSubscriptionId: subscriptionId,
      cartUpdatedDate: now,
      createdDate: now,
      costs: {
        tax: 0,
        tip: 0,
        mealTotal: 107.99,
        percentFee: 123,
        flatRateFee: 123,
      },
      deliveryDate: cart.deliveryDate,
    }
  }
}