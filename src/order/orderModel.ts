import { IConsumerProfile } from './../consumer/consumerModel';
import { ICost } from './costModel';
import { ICartInput, ICartMealInput } from './cartModel';

export interface EOrder {
  readonly rest: {
    readonly restId: string
    readonly meals: ICartMealInput[]
  }
  readonly status: 'Complete' | 'Pending' | 'Returned'
  readonly consumer: {
    readonly userId: string
    readonly profile: IConsumerProfile
  },
  readonly stripeChargeId: string
  readonly cartUpdatedDate: number
  readonly createdDate: number
  readonly costs: ICost
  readonly deliveryDate: number
  readonly planId: string
}

export interface IOrder extends EOrder {
  readonly _id: string
}

export class Order {
  static getOrderFromCartInput(cart: ICartInput): EOrder {
    return {
      rest: {
        restId: cart.restId,
        meals: cart.meals,
      },
      status: 'Pending',
      consumer: {
        userId: 'signedInUserId',
        profile: {
          name: 'signedInUserName',
          email: 'signedInUserEmail',
          phone: cart.phone,
          card: cart.card,
          destination: cart.destination,
        }
      },
      stripeChargeId: '123',
      planId: cart.consumerPlan.planId,
      cartUpdatedDate: Date.now(),
      createdDate: Date.now(),
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