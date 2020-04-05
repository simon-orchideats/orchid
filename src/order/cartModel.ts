import { ICartDelivery, CartDelivery, DeliveryMeal, IDeliveryMeal } from './deliveryModel';
import { ICard } from '../card/cardModel';
import { IDestination } from '../place/destinationModel';
import { IConsumerPlan, ISchedule, CuisineType, Schedule } from '../consumer/consumerModel';
import { IMeal, Meal } from '../rest/mealModel';
import { state } from '../place/addressModel';

export interface ICartInput {
  readonly paymentMethodId: string
  readonly card: ICard
  readonly consumerPlan: IConsumerPlan
  readonly donationCount: number
  readonly phone: string
  readonly destination: IDestination
  readonly deliveries: ICartDelivery[]
};

export interface ICart {
  readonly donationCount: number
  readonly deliveries: ICartDelivery[];
  readonly meals: IDeliveryMeal[]
  readonly schedule: ISchedule[];
  readonly zip: string | null;
}

export class Cart implements ICart {
  readonly donationCount: number
  readonly deliveries: CartDelivery[];
  readonly meals: DeliveryMeal[]
  readonly schedule: Schedule[];
  readonly zip: string | null;

  constructor(cart: ICart) {
    this.donationCount = cart.donationCount;
    this.deliveries = cart.deliveries.map(d => new CartDelivery(d));
    this.meals = cart.meals.map(m => new DeliveryMeal(m));
    this.schedule = cart.schedule.map(s => new Schedule(s));
    this.zip = cart.zip;
  }

  public get DonationCount() { return this.donationCount }
  public get Deliveries() { return this.deliveries }
  public get Meals() { return this.meals }
  public get Schedule() { return this.schedule }
  public get Zip() { return this.zip }

  public static getDeliveryMeals(meals: IMeal[], restId: string, restName: string) {
    return meals.reduce<DeliveryMeal[]>((groupings, meal) => {
      const groupIndex = groupings.findIndex(group => group.MealId === meal._id);
      if (groupIndex === -1) {
        groupings.push(DeliveryMeal.getDeliveryMeal(meal, restId, restName));
      } else {
        groupings[groupIndex] = new DeliveryMeal({
          ...groupings[groupIndex],
          quantity: groupings[groupIndex].quantity + 1,
        })
      }
      return groupings;
    }, [])
  }

  public static getMealCount(cart: ICart) {
    return cart.meals.reduce<number>((sum, meal) => sum + meal.quantity, 0) + cart.donationCount;
  }

  // todo simon: enable this
  //@ts-ignore
  public static getMealCountFromICartInput(cart: ICartInput) {
    // todo simon: do this
    return 8;
  }

  // todo simon: add a fn for setting deliveries, make sure when setting delivery we use getNextDeliveryDate

  public addMeal(newMeal: Meal, restId: string, restName: string) {
    // todo simon: add logic to put the new meal into the deliveries if we already have deliveries
    const newCart = new Cart(this);
    const index = newCart.Meals.findIndex(meal => meal.MealId === newMeal.Id);
    if (index === -1) {
      newCart.meals.push(DeliveryMeal.getDeliveryMeal(newMeal, restId, restName));
    } else {
      newCart.meals[index] = DeliveryMeal.getDeliveryMeal(
        newMeal,
        restId,
        restName,
        newCart.Meals[index].Quantity + 1
      );
    }
    return newCart;
  }

  public removeMeal(mealId: string) {
    // todo simon: add logic to remove meal from the deliveries if if we already have deliviers
    const newCart = new Cart(this);
    const index = newCart.Meals.findIndex(meal => meal.MealId === mealId);
    if (index === -1) {
      const err = new Error(`MealId '${mealId}' not found in cart`);
      console.error(err.stack);
      throw err;
    }
    const targetMeal = newCart.Meals[index];
    if (targetMeal.Quantity === 1) {
      newCart.Meals.splice(index, 1);
    } else {
      newCart.Meals[index] = new DeliveryMeal({
        ...targetMeal,
        quantity: targetMeal.Quantity - 1,
      })
    }
    return newCart;
  }

  public getCartInput(
    address1: string,
    address2: string | null,
    city: string,
    state: state,
    zip: string,
    phone: string,
    card: ICard,
    paymentMethodId: string,
    instructions: string,
    cuisines: CuisineType[],
  ): ICartInput {
    return {
      donationCount: this.DonationCount,
      paymentMethodId,
      card,
      phone,
      consumerPlan: {
        schedule: this.Schedule,
        cuisines,
      },
      destination: {
        address: {
          address1,
          address2: address2 ? address2 : undefined,
          city,
          state,
          zip,
        },
        instructions,
      },
      deliveries: this.deliveries,
    }
  }

}