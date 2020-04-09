import { getNextDeliveryDate } from './utils';
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
  readonly schedules: ISchedule[];
  readonly zip: string | null;
}

const getNextMealsIterator = (meals: DeliveryMeal[]) => {
  let uniqueMealIndex = 0;
  let sameMealIndex;
  return (numDesiredMeals: number) => {
    const res = [];
    while (uniqueMealIndex < meals.length) {
      const uniqueMeal = meals[uniqueMealIndex];
      sameMealIndex = 0;
      while (sameMealIndex < uniqueMeal.Quantity) {
        sameMealIndex++;
        res.push(new DeliveryMeal({
          ...uniqueMeal,
          quantity: 1,
        }));
        if (res.length === numDesiredMeals) return res;
      }
      uniqueMealIndex++;
    }
    return res;
  };
}

const addMealsToDelivery = (newMeals: DeliveryMeal[], deliveryInput: DeliveryInput) => {
  const deliveryMeals = deliveryInput.Meals;
  newMeals.forEach(newMeal => {
    for (let i = 0; i < deliveryMeals.length; i++) {
      if (deliveryMeals[i].MealId === newMeal.MealId) {
        deliveryMeals[i] = new DeliveryMeal({
          ...newMeal,
          quantity: deliveryMeals[i].quantity + 1,
        });
        return;
      }
    }
    deliveryMeals.push(newMeal);
  })
}

export class Cart implements ICart {
  readonly donationCount: number
  readonly deliveries: DeliveryInput[];
  readonly restMeals: meals
  readonly schedules: Schedule[];
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
    this.schedules = cart.schedules.map(s => new Schedule(s));
    this.zip = cart.zip;
  }

  public get DonationCount() { return this.donationCount }
  public get Deliveries() { return this.deliveries }
  public get RestMeals() { return this.restMeals }
  public get Schedules() { return this.schedules }
  public get Zip() { return this.zip }

  public setScheduleAndAutoDeliveries(schedules: Schedule[]) {
    const newCart = new Cart({
      ...this,
      schedules,
      deliveries: schedules.map(s => new DeliveryInput({
        deliveryTime: s.Time,
        deliveryDate: getNextDeliveryDate(s.Day).valueOf(),
        discount: null,
        meals: [],
      }))
    });
    
    let scheduleIndex = 0;
    Object.entries(this.RestMeals).forEach(([_restId, restMeals]) => {
      const numMeals = restMeals.mealCount;
      // todo replace 4 with a variable
      const numDeliveries = Math.floor(numMeals / 4);
      const numLeftOverMeals = numMeals % 4;
      const getNextMeals = getNextMealsIterator(restMeals.meals);
      for (let i = 0; i < numDeliveries; i++) {
        let meals;
        if (i === numDeliveries - 1) {
          meals = getNextMeals(4 + numLeftOverMeals);
        } else {
          meals = getNextMeals(4);
        }
        scheduleIndex = scheduleIndex % schedules.length;
        addMealsToDelivery(meals, newCart.deliveries[scheduleIndex]);
        scheduleIndex++;
      }                                                                                         
    })
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
        schedule: this.Schedules,
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