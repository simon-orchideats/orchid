import { PlanName, PlanNames, IPlan, Tier } from './../plan/planModel';
import { IDelivery, Delivery, IDeliveryMeal, IDeliveryInput } from './deliveryModel';
import moment from 'moment';
import { IDestination, Destination } from './../place/destinationModel';
import { IConsumerProfile, IConsumer, IMealPlan } from './../consumer/consumerModel';
import { ICost, deliveryFee } from './costModel';
import { Cart } from './cartModel';

export interface EOrder {
  readonly cartUpdatedDate: number
  readonly consumer: {
    readonly userId: string
    readonly profile: IConsumerProfile
  },
  readonly costs: ICost
  readonly createdDate: number
  readonly invoiceDate: number
  readonly stripeInvoiceId?: string,
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

  public static getMealPrices(mealPlans: IMealPlan[], plans: IPlan[]) {
    return mealPlans.reduce<IMealPrice[]>((mealPrices, mp) => [
      ...mealPrices,
      {
        stripePlanId: mp.stripePlanId,
        planName: mp.planName,
        mealPrice: Tier.getMealPrice(
          mp.planName,
          mp.mealCount,
          plans
        )
      }
    ], []);
  }
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
  readonly stripeInvoiceId: string | null
}

export interface IUpdateOrderInput {
  readonly meals: IDeliveryMeal[] | null // null for skip
  readonly deliveryIndex: number | null
  readonly donationCount: number
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
  readonly stripeInvoiceId: string | null

  constructor(order: IOrder) {
    this._id = order._id;
    this.invoiceDate = order.invoiceDate;
    this.deliveries = order.deliveries.map(d => new Delivery(d))
    this.destination = new Destination(order.destination);
    this.mealPrices = order.mealPrices.map(mp => new MealPrice(mp));
    this.phone = order.phone;
    this.name = order.name;
    this.donationCount = order.donationCount;
    this.stripeInvoiceId = order.stripeInvoiceId;
  }

  public get Id() { return this._id }
  public get InvoiceDate() { return this.invoiceDate }
  public get Deliveries() { return this.deliveries }
  public get Destination() { return this.destination }
  public get MealPrices() { return this.mealPrices }
  public get Phone() { return this.phone }
  public get DonationCount() { return this.donationCount }
  public get Name() { return this.name }
  public get StripeInvoiceId() { return this.stripeInvoiceId }

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
      donationCount: order.donationCount,
      stripeInvoiceId: order.stripeInvoiceId || null,
    }
  }

  static getUpdatedOrderInput(
    deliveryIndex?: number, 
    cart?: Cart,
  ): IUpdateOrderInput {
    return {
      meals: cart ?
        Object.values(cart.RestMeals).reduce<IDeliveryMeal[]>((sum, restMeals) => (
          [...sum, ...restMeals.meals]
        ), [])
        : 
        null,
      deliveryIndex: deliveryIndex ?? null,
      donationCount: cart ? cart.DonationCount : 0
    }
  }

  // todo simon do this
  // static getEOrderFromUpdatedOrder(
  //   {
  //     consumer,
  //   }: EOrder,
  //   mealPrice: number,
  //   total: number,
  //   {
  //     // todo simon: do this
  //     // deliveries,
  //     phone,
  //     destination,
  //     donationCount
  //   }: IUpdateOrderInput
  // ): Omit<EOrder, 'stripeSubscriptionId' | 'createdDate' | 'invoiceDate'> {
  //   return {
  //     cartUpdatedDate: Date.now(),
  //     costs: {
  //       tax: 0,
  //       tip: 0,
  //       mealPrice,
  //       total,
  //       percentFee: 0,
  //       flatRateFee: 0,
  //     },
  //     consumer: {
  //       userId: consumer.userId,
  //       profile: {
  //         name: consumer.profile.name,
  //         email: consumer.profile.email,
  //         phone,
  //         card: consumer.profile.card,
  //         destination,
  //       }
  //     },
  //     // todo simon. when copying over the deliveirs of time ICartDelivery to IOrderDelivery, we need to add a status,
  //     // so how do we do that? can we just put all status as Open...? no we can only set the ones open if it has NOT
  //     // been delivered.
  //     deliveries: [],
  //     donationCount
  //   }
  // }

  static getNewOrder(
    consumer: IConsumer,
    deliveries: IDeliveryInput[],
    donationCount: number,
    invoiceDate: number,
    mealPrices: IMealPrice[],
  ): EOrder {
    if (!consumer.stripeSubscriptionId) {
      const err = new Error('Missing subscription id');
      console.error(err.stack);
      throw err;
    }
    const tax = deliveries.reduce<number>((taxes, d) => 
      taxes + d.meals.reduce<number>((sum, m) => {
        const mealPrice = mealPrices.find(mp => mp.stripePlanId === m.stripePlanId);
        if (!mealPrice) {
          const err = new Error(`Could not find meal price for stipePlanId '${m.stripePlanId}'`);
          console.error(err.stack);
          throw err;
        }
        return sum + (m.taxRate * mealPrice.mealPrice * m.quantity)
      }, 0)
    , 0);
  
    const now = moment();
    return {
      consumer: {
        userId: consumer._id,
        profile: consumer.profile
      },
      stripeSubscriptionId: consumer.stripeSubscriptionId,
      cartUpdatedDate: now.valueOf(),
      createdDate: now.valueOf(),
      invoiceDate,
      costs: {
        tax: Math.round(tax),
        tip: 0,
        mealPrices,
        percentFee: 0,
        flatRateFee: 0,
        deliveryFee: (deliveries.length - 1) * deliveryFee
      },
      deliveries: deliveries.map<IDelivery>(delivery => ({ ...delivery, status: 'Open' })),
      donationCount,
    }
  }
}