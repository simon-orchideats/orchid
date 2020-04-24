import { PlanName, PlanNames } from './../plan/planModel';
import { IDelivery, Delivery, IDeliveryMeal, IDeliveryInput, DeliveryInput } from './deliveryModel';
import { SignedInUser } from './../utils/apolloUtils';
import moment from 'moment';
import { IDestination, Destination } from './../place/destinationModel';
import { IConsumerProfile } from './../consumer/consumerModel';
import { ICost } from './costModel';
import { ICartInput } from './cartModel';

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

export interface IMealPrice {
  readonly stripePlanId: string
  readonly planName: PlanName
  readonly mealPrice: number
}

export class MealPrice implements IMealPrice {
  readonly stripePlanId: string
  readonly planName: PlanName
  readonly mealPrice: number

  constructor(mp: IMealPrice) {
    this.stripePlanId = mp.stripePlanId;
    this.planName = mp.planName;
    this.mealPrice = mp.mealPrice;
  }

  public get StripePlanId() { return this.stripePlanId }
  public get PlanName() { return this.planName }
  public get MealPrice() { return this.mealPrice }
}

export interface IOrder {
  readonly _id: string
  readonly invoiceDate: number
  readonly deliveries: IDelivery[]
  // destination will be removed when we support a desitnation per delivery
  readonly destination: IDestination
  readonly mealPrices: IMealPrice[]
  readonly phone: string
  readonly name: string
  readonly donationCount: number
}

export interface IUpdateDeliveryInput {
  readonly donationCount: number
  readonly deliveries: IDeliveryInput[]
}

export class Order implements IOrder{
  readonly _id: string
  readonly invoiceDate: number
  readonly deliveries: Delivery[]
  readonly destination: Destination
  readonly mealPrices: MealPrice[]
  readonly phone: string
  readonly name: string
  readonly donationCount: number

  constructor(order: IOrder) {
    this._id = order._id;
    this.invoiceDate = order.invoiceDate;
    this.deliveries = order.deliveries.map(d => new Delivery(d))
    this.destination = new Destination(order.destination);
    this.mealPrices = order.mealPrices.map(mp => new MealPrice(mp));
    this.phone = order.phone;
    this.name = order.name;
    this.donationCount = order.donationCount;
  }

  public get Id() { return this._id }
  public get InvoiceDate() { return this.invoiceDate }
  public get Deliveries() { return this.deliveries }
  public get Destination() { return this.destination }
  public get MealPrices() { return this.mealPrices }
  public get Phone() { return this.phone }
  public get DonationCount() { return this.donationCount}
  public get Name() { return this.name}

  static getMealCount(order: IOrder, planName: PlanName,) {
    const totalMeals = order.deliveries.reduce((sum, delivery) => {
      return sum + delivery.meals.reduce((innerSum, m) => (
        m.planName === planName ? innerSum + m.quantity : innerSum
      ), 0);
    }, 0);

    if (planName === PlanNames.Standard) return totalMeals + order.donationCount;
  }
  // todo simon do this.
  // static getIOrderFromUpdatedOrderInput(
  //   _id: string,
  //   order: IUpdateOrderInput,
  //   mealPrice: number,
  //   // status: OrderStatus,
  //   // rest: IRest | null
  // ): IOrder {
  //   return {
  //     _id,
  //     deliveries: [],
  //     destination: Destination.getICopy(order.destination),
  //     mealPrice,
  //     phone: order.phone,
  //     name: order.name,
  //     donationCount: order.donationCount
  //   }
  // }

  static getIOrderFromEOrder(_id: string, order: EOrder): IOrder {
    return {
      _id,
      invoiceDate: order.invoiceDate,
      deliveries: order.deliveries,
      destination: order.consumer.profile.destination!, // todo simon check why NonNullable doesnt work
      mealPrices: order.costs.mealPrices,
      phone: order.consumer.profile.phone!,
      name: order.consumer.profile.name,
      donationCount: order.donationCount
    }
  }

  static getUpdatedDeliveryInput(
    deliveries: DeliveryInput[],
    donationCount: number,
  ): IUpdateDeliveryInput {
    return {
      donationCount: donationCount ? donationCount : 0,
      deliveries: deliveries
    }
  }

  static getEOrderFromUpdatedDeliveries(
    {
      consumer,
      costs,
    }: EOrder,
    mealPrices: IMealPrice[],
    deliveries: IDelivery[],
    donationCount : number
  ): Omit<EOrder, 'stripeSubscriptionId' | 'createdDate' | 'invoiceDate'> {
    return {
      cartUpdatedDate: Date.now(),
      costs: {
        ...costs,
        mealPrices
      },
      consumer,
      deliveries,
      donationCount
    }
  }

  static getEOrderFromSkippedDelivery(
    {
      consumer,
      deliveries,
      costs,
      donationCount
    }: EOrder,
  ): Omit<EOrder, 'stripeSubscriptionId' | 'createdDate' | 'invoiceDate'> {
    return {
      cartUpdatedDate: Date.now(),
      costs,
      consumer,
      deliveries,
      donationCount,
    }
  }

  static getEOrderFromRemoveDonations(
    {
      consumer,
      deliveries,
      costs,
    }: EOrder,
    mealPrices: IMealPrice[],
  ): Omit<EOrder, 'stripeSubscriptionId' | 'createdDate' | 'invoiceDate'> {
    return {
      cartUpdatedDate: Date.now(),
      costs: {
        ...costs,
        mealPrices
      },
      consumer,
      deliveries,
      donationCount: 0,
    }
  }

  static getNewOrderFromCartInput(
    signedInUser: SignedInUser,
    cart: ICartInput,
    invoiceDate: number,
    subscriptionId: string,
    mealPrices: IMealPrice[],
  ): EOrder {
    if (!signedInUser) {
      const err = new Error ('Signed in user null');
      console.error(err.stack)
      throw err;
    }
    const now = moment();
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
        mealPrices,
        percentFee: 0,
        flatRateFee: 0,
      },
      deliveries: cart.deliveries.map<IDelivery>(delivery => ({ ...delivery, status: 'Open' })),
      donationCount: cart.donationCount
    }
  }
}