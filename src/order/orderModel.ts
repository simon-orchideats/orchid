import { IDelivery, Delivery, IDeliveryInput } from './deliveryModel';
import { SignedInUser } from './../utils/apolloUtils';
import moment from 'moment';
import { IDestination, Destination } from './../place/destinationModel';
import { IConsumerProfile } from './../consumer/consumerModel';
import { ICost } from './costModel';
import { ICartInput, Cart } from './cartModel';

export interface EOrder {
  readonly cartUpdatedDate: number
  readonly consumer: {
    readonly userId: string
    readonly profile: IConsumerProfile
  },
  readonly costs: ICost
  readonly createdDate: number
  readonly invoiceDate: number
  readonly deliveries: IDelivery[]
  readonly stripeSubscriptionId: string
  readonly donationCount: number
}

export interface IOrder {
  readonly _id: string
  readonly deliveries: IDelivery[]
  // destination will be removed when we support a desitnation per delivery
  readonly destination: IDestination
  readonly mealPrice: number
  readonly phone: string
  readonly name: string
  readonly donationCount: number
}

export interface IUpdateOrderInput {
  readonly deliveries: IDeliveryInput[]
  readonly phone: string
  readonly destination: IDestination
  readonly name: string
  readonly donationCount: number
}

export class Order implements IOrder{
  readonly _id: string
  readonly deliveries: Delivery[]
  readonly destination: Destination
  readonly mealPrice: number
  readonly phone: string
  readonly name: string
  readonly donationCount: number

  constructor(order: IOrder) {
    this._id = order._id;
    this.deliveries = order.deliveries.map(d => new Delivery(d))
    this.destination = new Destination(order.destination);
    this.mealPrice = order.mealPrice;
    this.phone = order.phone;
    this.name = order.name;
    this.donationCount = order.donationCount;
  }

  public get Id() { return this._id }
  public get Deliveries() { return this.deliveries }
  public get Destination() { return this.destination }
  public get MealPrice() { return this.mealPrice }
  public get Phone() { return this.phone }
  public get DonationCount() { return this.donationCount}
  public get Name() { return this.name}

  // todo simon: do this
  //@ts-ignore
  static getMealCount(order: IOrder) {
    // simon: update this to use deliveries
    // return order.meals.reduce<number>((sum, meal) => sum + meal.quantity, 0) + order.donationCount;
    return 10;
  }

  // todo simon do this.
  static getIOrderFromUpdatedOrderInput(
    _id: string,
    order: IUpdateOrderInput,
    mealPrice: number,
    // status: OrderStatus,
    // rest: IRest | null
  ): IOrder {
    return {
      _id,
      deliveries: [],
      destination: Destination.getICopy(order.destination),
      mealPrice,
      phone: order.phone,
      name: order.name,
      donationCount: order.donationCount
    }
  }

  static getIOrderFromEOrder(_id: string, order: EOrder): IOrder {
    return {
      _id,
      // todo simon: do this.
      deliveries: [],
      destination: order.consumer.profile.destination!, // todo simon check why NonNullable doesnt work
      mealPrice: order.costs.mealPrice,
      phone: order.consumer.profile.phone!,
      name: order.consumer.profile.name,
      donationCount: order.donationCount
    }
  }

  static getUpdatedOrderInput(order: Order, cart?: Cart): IUpdateOrderInput {
    return {
      // todo simon: do this
      deliveries: [],
      phone: order.Phone,
      destination: order.Destination,
      name: order.Name,
      donationCount: cart ? cart.DonationCount : 0
    }
  }

  static getEOrderFromUpdatedOrder(
    {
      consumer,
    }: EOrder,
    mealPrice: number,
    total: number,
    {
      // todo simon: do this
      // deliveries,
      phone,
      destination,
      donationCount
    }: IUpdateOrderInput
  ): Omit<EOrder, 'stripeSubscriptionId' | 'createdDate' | 'invoiceDate'> {
    return {
      cartUpdatedDate: Date.now(),
      costs: {
        tax: 0,
        tip: 0,
        mealPrice,
        total,
        percentFee: 0,
        flatRateFee: 0,
      },
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
      // todo simon. when copying over the deliveirs of time ICartDelivery to IOrderDelivery, we need to add a status,
      // so how do we do that? can we just put all status as Open...? no we can only set the ones open if it has NOT
      // been delivered.
      deliveries: [],
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
    const EDeliveries = cart.deliveries.map<IDelivery>(delivery => ({ ...delivery, status: 'Open' }))
    return {
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
      // todo simon: actually do this
      deliveries: EDeliveries,
      donationCount: cart.donationCount
    }
  }
}