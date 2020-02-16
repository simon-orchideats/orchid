import { IDestination, Destination } from './../place/destinationModel';
import { IRest, Rest } from './../rest/restModel';
import { IConsumerProfile } from './../consumer/consumerModel';
import { ICost } from './costModel';
import { ICartInput, ICartMeal, CartMeal } from './cartModel';

type OrderStatus = 'Complete' | 'Confirmed' | 'Open' | 'Returned';

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
    readonly meals: ICartMeal[]
  }
  readonly status: OrderStatus
  readonly stripeSubscriptionId: string
}

export interface IOrder {
  readonly _id: string
  readonly deliveryDate: number
  readonly destination: IDestination
  readonly mealPrice: number
  readonly meals: ICartMeal[]
  readonly phone: string
  readonly rest: IRest
  readonly status: OrderStatus
}

export class Order implements IOrder{
  readonly _id: string
  readonly deliveryDate: number
  readonly destination: Destination
  readonly mealPrice: number
  readonly meals: CartMeal[]
  readonly phone: string
  readonly rest: Rest
  readonly status: OrderStatus

  constructor(order: IOrder) {
    this._id = order._id;
    this.deliveryDate = order.deliveryDate;
    this.destination = new Destination(order.destination);
    this.mealPrice = order.mealPrice;
    this.meals = order.meals.map(meal => new CartMeal(meal))
    this.phone = order.phone;
    this.rest = new Rest(order.rest)
    this.status = order.status
  }

  public get Id() { return this._id }
  public get DeliveryDate() { return this.deliveryDate }
  public get Destination() { return this.destination }
  public get MealPrice() { return this.mealPrice }
  public get Meals() { return this.meals }
  public get Phone() { return this.phone }
  public get Rest() { return this.rest }
  public get Status() { return this.status }

  static getIOrderFromEOrder(_id: string, order: EOrder, rest: IRest): IOrder {
    return {
      _id,
      deliveryDate: order.deliveryDate,
      destination: order.consumer.profile.destination,
      mealPrice: order.costs.mealPrice,
      meals: order.rest.meals,
      phone: order.consumer.profile.phone,
      rest,
      status: order.status,
    }
  }

  static getNewOrderFromCartInput(
    signedInUser: any,
    cart: ICartInput,
    subscriptionId: string,
    mealPrice: number,
    total: number,
  ): EOrder {
    const now = Date.now();
    return {
      rest: {
        restId: cart.restId,
        meals: cart.meals,
      },
      status: 'Open',
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
        mealPrice,
        total,
        percentFee: 123,
        flatRateFee: 123,
      },
      deliveryDate: cart.deliveryDate,
    }
  }
}