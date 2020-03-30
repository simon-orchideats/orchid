import { SignedInUser } from './../utils/apolloUtils';
import moment from 'moment';
import { IDestination, Destination } from './../place/destinationModel';
import { IRest, Rest } from './../rest/restModel';
import { IConsumerProfile, deliveryTime } from './../consumer/consumerModel';
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
  readonly deliveryTime: deliveryTime
  readonly rest: {
    readonly restId: string | null // null for skipped order
    readonly meals: ICartMeal[]
  }
  readonly status: OrderStatus
  readonly stripeSubscriptionId: string
  readonly donationCount: number
}

export interface IOrder {
  readonly _id: string
  readonly deliveryDate: number
  readonly destination: IDestination
  readonly deliveryTime: deliveryTime
  readonly mealPrice: number | null
  readonly meals: ICartMeal[]
  readonly phone: string
  readonly rest: IRest | null // null for skipped order
  readonly status: OrderStatus
  readonly name: string
  readonly donationCount: number
}

export interface IUpdateOrderInput {
  // nulls for skipping an order
  readonly restId: string | null
  readonly meals: ICartMeal[]
  readonly phone: string
  readonly destination: IDestination
  readonly deliveryDate: number
  readonly deliveryTime: deliveryTime
  readonly name: string
  readonly donationCount: number
}

export class Order implements IOrder{
  readonly _id: string
  readonly deliveryDate: number
  readonly deliveryTime: deliveryTime
  readonly destination: Destination
  readonly mealPrice: number | null
  readonly meals: CartMeal[]
  readonly phone: string
  readonly rest: Rest | null
  readonly status: OrderStatus
  readonly name: string
  readonly donationCount: number

  constructor(order: IOrder) {
    this._id = order._id;
    this.deliveryDate = order.deliveryDate;
    this.deliveryTime = order.deliveryTime;
    this.destination = new Destination(order.destination);
    this.mealPrice = order.mealPrice;
    this.meals = order.meals.map(meal => new CartMeal(meal))
    this.phone = order.phone;
    this.rest = order.rest ? new Rest(order.rest) : null;
    this.status = order.status
    this.name = order.name;
    this.donationCount = order.donationCount;
  }

  public get Id() { return this._id }
  public get DeliveryDate() { return this.deliveryDate }
  public get DeliveryTime() { return this.deliveryTime }
  public get Destination() { return this.destination }
  public get MealPrice() { return this.mealPrice }
  public get Meals() { return this.meals }
  public get Phone() { return this.phone }
  public get Rest() { return this.rest }
  public get Status() { return this.status }
  public get DonationCount() { return this.donationCount}
  public get Name() { return this.name}

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
      deliveryTime: order.deliveryTime,
      destination: Destination.getICopy(order.destination),
      mealPrice,
      meals: order.meals.map(meal => CartMeal.getICopy(meal)),
      phone: order.phone,
      rest: rest ? Rest.getICopy(rest) : null,
      status,
      name: order.name,
      donationCount: order.donationCount
    }
  }

  static getIOrderFromEOrder(_id: string, order: EOrder, rest: IRest | null): IOrder {
    return {
      _id,
      deliveryDate: order.deliveryDate,
      deliveryTime: order.deliveryTime,
      destination: order.consumer.profile.destination!, // todo simon check why NonNullable doesnt work
      mealPrice: order.costs.mealPrice,
      meals: order.rest.meals,
      phone: order.consumer.profile.phone!,
      rest,
      status: order.status,
      name: order.consumer.profile.name,
      donationCount: order.donationCount
    }
  }

  static getUpdatedOrderInput(order: Order, cart?: Cart): IUpdateOrderInput {
    return {
      restId: cart && cart.RestId ? cart.RestId : null,
      meals: cart && Cart.getMealCount(cart.Meals) ? cart.Meals : [],
      phone: order.Phone,
      destination: order.Destination,
      deliveryDate: order.DeliveryDate,
      deliveryTime: order.DeliveryTime,
      name: order.Name,
      donationCount: cart ? cart.DonationCount : 0
    }
  }

  static getEOrderFromUpdatedOrder(
    {
      consumer,
    }: EOrder,
    mealPrice: number | null,
    total: number,
    {
      restId,
      meals,
      phone,
      destination,
      deliveryDate,
      deliveryTime,
      donationCount
    }: IUpdateOrderInput
  ): Omit<EOrder, 'stripeSubscriptionId' | 'createdDate' | 'invoiceDate'> {
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
        percentFee: 0,
        flatRateFee: 0,
      },
      deliveryDate,
      deliveryTime,
      consumer: {
        userId: consumer.userId,
        profile: {
          name: consumer.profile.name,
          email: consumer.profile.email,
          phone,
          card: consumer.profile.card,
          destination,
        }
      },
      status: (Cart.getMealCount(meals) > 0 && donationCount >= 0) ? 'Open' : 'Skipped',
      donationCount
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
    if (!signedInUser) {
      const err = new Error ('Signed in user null');
      console.error(err.stack)
      throw err;
    }
    const now = moment();
    return {
      rest: {
        restId: cart.restId,
        meals: cart.meals,
      },
      status: Cart.getMealCount(cart.meals) > 0 ? 'Open' : 'Skipped',
      consumer: {
        userId: signedInUser._id,
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
        percentFee: 0,
        flatRateFee: 0,
      },
      deliveryDate: cart.deliveryDate,
      deliveryTime: cart.consumerPlan.deliveryTime,
      donationCount: cart.donationCount
    }
  }
}