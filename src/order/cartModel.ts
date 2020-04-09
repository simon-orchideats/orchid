import { IDeliveryInput, DeliveryInput, DeliveryMeal } from './deliveryModel';
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
  readonly deliveries: IDeliveryInput[]
};

type meals = {
  [key: string]: {
    mealCount: number,
    meals: DeliveryMeal[]
  }
};

export interface ICart {
  readonly donationCount: number
  readonly deliveries: IDeliveryInput[];
  readonly restMeals: meals
  readonly schedule: ISchedule[];
  readonly zip: string | null;
}

export class Cart implements ICart {
  readonly donationCount: number
  readonly deliveries: DeliveryInput[];
  readonly restMeals: meals
  readonly schedule: Schedule[];
  readonly zip: string | null;

  constructor(cart: ICart) {
    this.donationCount = cart.donationCount;
    this.deliveries = cart.deliveries.map(d => new DeliveryInput(d));
    this.restMeals = Object.entries(cart.restMeals).reduce<meals>((map, [restId, data]) => {
      map[restId] = {
        mealCount: data.mealCount,
        meals: data.meals.map(m => new DeliveryMeal(m))
      }
      return map;
    }, {});
    this.schedule = cart.schedule.map(s => new Schedule(s));
    this.zip = cart.zip;
  }

  public get DonationCount() { return this.donationCount }
  public get Deliveries() { return this.deliveries }
  public get RestMeals() { return this.restMeals }
  public get Schedule() { return this.schedule }
  public get Zip() { return this.zip }

  public autoSetMealsInDeliveries(deliveries: DeliveryInput[]) {
    const newCart = new Cart({
      ...this,
      deliveries,
    });
    
    /**
     * 
     * // left off here
     * get the total number of actual meals. then get the number of delivery days.
     * 
     * days / meals = meals per day.
     * 
     * loop through rests. for each rest
     *  - divide count by 4 and floor it
     *  - this gives us the number of deliviries you can spread this accross
     *  - loop across this spread starting at i = 0
     *    - get next 4 meals (by looping through the meals and doublly looping through quantity)
     *    - put them into schedule[i]
     *  - put remaining meals into schedule[0]
     * 
     */

    return newCart;
  }

  // todo simon: add a fn for setting deliveries, make sure when setting delivery we use getNextDeliveryDate
  public addMeal(newMeal: Meal, restId: string, restName: string) {
    // todo simon: add logic to put the new meal into the deliveries if we already have deliveries
    const newCart = new Cart(this);
    const restMeals = newCart.RestMeals[restId];
    if (restMeals) {
      newCart.RestMeals[restId].mealCount = restMeals.mealCount + 1;
      const index = restMeals.meals.findIndex(meal => meal.MealId === newMeal.Id);
      if (index === -1) {
        restMeals.meals.push(DeliveryMeal.getDeliveryMeal(newMeal, restId, restName));
      } else {
        restMeals.meals[index] = DeliveryMeal.getDeliveryMeal(
          newMeal,
          restId,
          restName,
          restMeals.meals[index].Quantity + 1
        )
      }
    } else {
      newCart.RestMeals[restId] = {
        mealCount: 1,
        meals: [
          DeliveryMeal.getDeliveryMeal(
            newMeal,
            restId,
            restName,
          )
        ]
      }
    }
    return newCart;
  }

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

  public getMealCount() {
    return Object.values(this.restMeals).reduce<number>((sum, data) => sum + data.mealCount, 0) + this.donationCount;
  }

  // todo simon: enable this
  //@ts-ignore
  public static getMealCountFromICartInput(cart: ICartInput) {
    // todo simon: do this
    return 8;
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

  public removeMeal(restId: string, mealId: string) {
    // todo simon: add logic to remove meal from the deliveries if if we already have deliviers
    const newCart = new Cart(this);
    const restMeals = newCart.RestMeals[restId];
    const index = restMeals.meals.findIndex(meal => meal.MealId === mealId);
    if (index === -1) {
      const err = new Error(`MealId '${mealId}' not found in cart`);
      console.error(err.stack);
      throw err;
    }
    restMeals.mealCount = restMeals.mealCount - 1;
    if (restMeals.mealCount === 0) {
      delete newCart.RestMeals[restId];
      return newCart;
    }
    const targetMeal = restMeals.meals[index];
    if (targetMeal.Quantity === 1) {
      restMeals.meals.splice(index, 1);
    } else {
      restMeals.meals[index] = new DeliveryMeal({
        ...targetMeal,
        quantity: targetMeal.Quantity - 1,
      })
    }
    return newCart;
  }
}