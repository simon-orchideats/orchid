import { SignedInUser } from './../utils/apolloUtils';
import moment from 'moment';
import { IDestination, Destination } from './../place/destinationModel';
import { IRest, Rest } from './../rest/restModel';
import { IConsumerProfile } from './../consumer/consumerModel';
import { ICost } from './costModel';
import { ICartInput, ICartMeal, CartMeal, Cart } from './cartModel';

type OrderStatus = 'Complete' | 'Confirmed' | 'Open' | 'Returned' | 'Skipped';

export interface EOrder {
  readonly cartUpdatedDate: number
  readonly consumer: {
    readonly userId: string
    readonly profile: IConsumerProfile
  },
  readonly costs: ICost
  readonly createdDate: number
  readonly invoiceDate: number
  readonly deliveryDate: number
  readonly rest: {
    readonly restId: string | null // null for skipped order
    readonly meals: ICartMeal[]
  }
  readonly status: OrderStatus
  readonly stripeSubscriptionId: string
}

export interface IOrder {
  readonly _id: string
  readonly deliveryDate: number
  readonly destination: IDestination
  readonly mealPrice: number | null
  readonly meals: ICartMeal[]
  readonly phone: string
  readonly rest: IRest | null // null for skipped order
  readonly status: OrderStatus
}

export interface IUpdateOrderInput {
  // nulls for skipping an order
  readonly restId: string | null
  readonly meals: ICartMeal[]
  readonly phone: string
  readonly destination: IDestination
  readonly deliveryDate: number
}

export class Order implements IOrder{
  readonly _id: string
  readonly deliveryDate: number
  readonly destination: Destination
  readonly mealPrice: number | null
  readonly meals: CartMeal[]
  readonly phone: string
  readonly rest: Rest | null
  readonly status: OrderStatus

  constructor(order: IOrder) {
    this._id = order._id;
    this.deliveryDate = order.deliveryDate;
    this.destination = new Destination(order.destination);
    this.mealPrice = order.mealPrice;
    this.meals = order.meals.map(meal => new CartMeal(meal))
    this.phone = order.phone;
    this.rest = order.rest ? new Rest(order.rest) : null;
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

  static getIOrderFromUpdatedOrderInput(
    _id: string,
    order: IUpdateOrderInput,
    mealPrice: number | null,
    status: OrderStatus,
    rest: IRest | null
  ): IOrder {
    return {
      _id,
      deliveryDate: order.deliveryDate,
      destination: Destination.getICopy(order.destination),
      mealPrice,
      meals: order.meals.map(meal => CartMeal.getICopy(meal)),
      phone: order.phone,
      rest: rest ? Rest.getICopy(rest) : null,
      status,
    }
  }

  static getIOrderFromEOrder(_id: string, order: EOrder, rest: IRest | null): IOrder {
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

  static getUpdatedOrderInput(order: Order, cart?: Cart): IUpdateOrderInput {
    return {
      restId: cart && cart.RestId ? cart.RestId : null,
      meals: cart && Cart.getMealCount(cart.Meals) ? cart.Meals : [],
      phone: order.Phone,
      destination: order.Destination,
      deliveryDate: order.DeliveryDate,
    }
  }

  static getEOrderFromUpdatedOrder(
    {
      consumer
    }: EOrder,
    mealPrice: number | null,
    total: number,
    {
      restId,
      meals,
      phone,
      destination,
      deliveryDate,
    }: IUpdateOrderInput
  ): Partial<EOrder> {
    return {
      rest: {
        restId,
        meals,
      },
      cartUpdatedDate: Date.now(),
      costs: {
        tax: 0,
        tip: 0,
        mealPrice,
        total,
        percentFee: 123,
        flatRateFee: 123,
      },
      deliveryDate,
      consumer: {
        userId: consumer.userId,
        profile: {
          name: consumer.profile.name,
          email: consumer.profile.email,
          phone,
          card: consumer.profile.card,
          destination,
        }
      }
    }
  }

  static getNewOrderFromCartInput(
    signedInUser: SignedInUser,
    cart: ICartInput,
    invoiceDate: number,
    subscriptionId: string,
    mealPrice: number,
    total: number,
  ): EOrder {
    const now = moment();
    return {
      rest: {
        restId: cart.restId,
        meals: cart.meals,
      },
      status: 'Open',
      consumer: {
        userId: signedInUser.userId,
        profile: {
          name: signedInUser.profile.name,
          email: signedInUser.profile.email,
          phone: cart.phone,
          card: cart.card,
          destination: cart.destination,
        }
      },
      stripeSubscriptionId: subscriptionId,
      cartUpdatedDate: now.valueOf(),
      createdDate: now.valueOf(),
      invoiceDate,
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