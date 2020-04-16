import { MIN_MEALS } from './../plan/planModel';
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

export type RestMeals = {
  [key: string]: {
    mealCount: number,
    meals: DeliveryMeal[]
  }
};

export interface ICart {
  readonly donationCount: number
  readonly deliveries: IDeliveryInput[];
  readonly restMeals: RestMeals
  readonly schedules: ISchedule[];
  readonly zip: string | null;
}

const getNextMealsIterator = (meals: DeliveryMeal[]) => {
  const copy = meals.map(m => new DeliveryMeal(m));
  let uniqueMealIndex = 0;
  return (numDesiredMeals: number) => {
    const res = [];
    while (uniqueMealIndex < copy.length) {
      const uniqueMeal = copy[uniqueMealIndex];
      res.push(new DeliveryMeal({
        ...uniqueMeal,
        quantity: 1,
      }));
      if (uniqueMeal.Quantity === 1) {
        copy.splice(uniqueMealIndex, 1);
        uniqueMealIndex--;
      } else {
        copy[uniqueMealIndex] = new DeliveryMeal({
          ...uniqueMeal,
          quantity: uniqueMeal.Quantity - 1,
        })
      }
      uniqueMealIndex++;
      if (uniqueMealIndex === copy.length) uniqueMealIndex = 0;
      if (res.length === numDesiredMeals) return res;
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
  readonly restMeals: RestMeals
  readonly schedules: Schedule[];
  readonly zip: string | null;

  constructor(cart: ICart) {
    this.donationCount = cart.donationCount;
    this.deliveries = cart.deliveries.map(d => new DeliveryInput(d));
    this.restMeals = Object.entries(cart.restMeals).reduce<RestMeals>((map, [restId, data]) => {
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
    Object.values(this.RestMeals).forEach(restMeals => {
      const numMeals = restMeals.mealCount;
      const numDeliveries = Math.floor(numMeals / MIN_MEALS);
      const numLeftOverMeals = numMeals % MIN_MEALS;
      const getNextMeals = getNextMealsIterator(restMeals.meals);
      for (let i = 0; i < numDeliveries; i++) {
        let meals;
        if (i === numDeliveries - 1) {
          meals = getNextMeals(MIN_MEALS + numLeftOverMeals);
        } else {
          meals = getNextMeals(MIN_MEALS);
        }
        scheduleIndex = scheduleIndex % schedules.length;
        addMealsToDelivery(meals, newCart.deliveries[scheduleIndex]);
        scheduleIndex++;
      }                                                                                         
    })
    return newCart;
  }

  public addMeal(newMeal: Meal, restId: string, restName: string) {
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

    if (newCart.Deliveries.length > 0) {
      const firstDelivery = newCart.Deliveries[0];
      const newMealIndex = firstDelivery.meals.findIndex(m => m.MealId === newMeal.Id);
      if (newMealIndex === -1) {
        firstDelivery.Meals.push(
          DeliveryMeal.getDeliveryMeal(
            newMeal,
            restId,
            restName,
        ));
      } else {
        firstDelivery.Meals[newMealIndex] = new DeliveryMeal({
          ...firstDelivery.Meals[newMealIndex],
          quantity: firstDelivery.Meals[newMealIndex].quantity + 1,
        })
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
      deliveries: this.Deliveries,
    }
  }

  public moveMealToNewDelivery(meal: DeliveryMeal, fromDeliveryIndex: number, toDeliveryIndex: number) {
    const newCart = new Cart(this);
    const fromDeliveryMeals = newCart.Deliveries[fromDeliveryIndex].Meals
    const fromMealIndex = fromDeliveryMeals.findIndex(m => m.MealId === meal.MealId);
    if (meal.Quantity > 1) {
      fromDeliveryMeals[fromMealIndex] = new DeliveryMeal({
        ...meal,
        quantity: meal.Quantity - 1,
      });
    } else {
      fromDeliveryMeals.splice(fromMealIndex, 1);
    }
    const newDeliveryMeals = newCart.Deliveries[toDeliveryIndex].Meals;
    const toMealIndex = newDeliveryMeals.findIndex(m => m.MealId === meal.MealId);
    if (toMealIndex === -1) {
      newDeliveryMeals.push(new DeliveryMeal({
        ...meal,
        quantity: 1,
      }))
    } else {
      newDeliveryMeals[toMealIndex] = new DeliveryMeal({
        ...meal,
        quantity: newDeliveryMeals[toMealIndex].Quantity + 1,
      })
    }
    return newCart;
  }

  public removeMeal(restId: string, mealId: string) {
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

    let removedMealDeliveryIndex = -1;
    let removedMealMealsIndex = -1;

    for (let i = 0; i < newCart.Deliveries.length; i++) {
      const meals = newCart.Deliveries[i].Meals;
      for (let j = 0; j < meals.length; j++) {
        if (meals[j].MealId === mealId) {
          removedMealDeliveryIndex = i;
          removedMealMealsIndex = j;
          break;
        }
      }
      if (removedMealDeliveryIndex > -1) break;
    }

    if (removedMealDeliveryIndex > -1) {
      const targetMeal = newCart.Deliveries[removedMealDeliveryIndex].Meals[removedMealMealsIndex];
      if (targetMeal.Quantity > 1) {
        newCart.Deliveries[removedMealDeliveryIndex].Meals[removedMealMealsIndex] = new DeliveryMeal({
          ...targetMeal,
          quantity: targetMeal.Quantity - 1,
        });
      } else {
        newCart.Deliveries[removedMealDeliveryIndex].Meals.splice(removedMealMealsIndex, 1);
      }
    }

    return newCart;
  }
}