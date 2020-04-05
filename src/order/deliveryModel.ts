import { IMeal } from './../rest/mealModel';
import { IDestination, Destination } from './../place/destinationModel';
import { ISchedule, Schedule } from './../consumer/consumerModel';

type DeliveryStatus = 'Complete' | 'Confirmed' | 'Open' | 'Returned' | 'Skipped';

export interface IDeliveryMeal {
  readonly mealId: string
  readonly name: string
  readonly img?: string
  readonly quantity: number
  readonly restId: string
  readonly restName: string
}

export class DeliveryMeal implements IDeliveryMeal {
  readonly mealId: string;
  readonly img?: string;
  readonly name: string;
  readonly quantity: number
  readonly restId: string
  readonly restName: string

  constructor(meal: IDeliveryMeal) {
    this.mealId = meal.mealId;
    this.img = meal.img;
    this.name = meal.name;
    this.quantity = meal.quantity;
    this.restId = meal.restId;
    this.restName = meal.restName;
  }

  public get MealId() { return this.mealId }
  public get Img() { return this.img }
  public get Name() { return this.name }
  public get Quantity() { return this.quantity }
  public get RestId() { return this.restId }
  public get RestName() { return this.restName }

  static getDeliveryMeal(meal: IMeal, restId: string, restName: string, quantity: number = 1) {
    return new DeliveryMeal({
      mealId: meal._id,
      img: meal.img,
      name: meal.name,
      quantity,
      restId,
      restName,
    });
  }

  static getICopy(meal: IDeliveryMeal): IDeliveryMeal {
    return {
      ...meal
    }
  }
}

export interface ICartDelivery {
  readonly schedule: ISchedule
  readonly deliveryDate: number
  // storing destination inside destination so that eventually we can support mulitple destinations
  readonly destination: IDestination;
  readonly discount: number
  readonly meals: IDeliveryMeal[]
}

export class CartDelivery implements ICartDelivery {
  readonly schedule: Schedule
  readonly deliveryDate: number
  readonly destination: Destination
  readonly discount: number
  readonly meals: DeliveryMeal[]

  constructor(delivery: ICartDelivery) {
    this.destination = new Destination(delivery.destination);
    this.deliveryDate = delivery.deliveryDate;
    this.discount = delivery.discount;
    this.meals = delivery.meals.map(m => new DeliveryMeal(m));
    this.schedule = new Schedule(delivery.schedule);
  }

  public get Destination() { return this.destination }
  public get DeliveryDate() { return this.deliveryDate }
  public get Discount() { return this.discount }
  public get Meals() { return this.meals }
  public get Schedule() { return this.schedule }

  static getICopy(d: ICartDelivery): ICartDelivery {
    return {
      ...d,
      destination: Destination.getICopy(d.destination),
      meals: d.meals.map(m => DeliveryMeal.getICopy(m)),
      schedule: Schedule.getICopy(d.schedule),
    }
  }
}

export interface IOrderDelivery extends ICartDelivery {
  readonly status: DeliveryStatus
}

export class OrderDelivery extends CartDelivery implements IOrderDelivery {
  readonly status: DeliveryStatus
  
  constructor(delivery: IOrderDelivery) {
    super(delivery);
    this.status = delivery.status;
  }

  public get Status() { return this.status }

  static getICopy(d: IOrderDelivery): IOrderDelivery {
    return {
      ...CartDelivery.getICopy(d),
      status: d.status,
    }
  }
} 

