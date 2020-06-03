import { MIN_MEALS, PlanNames } from './../plan/planModel';
import { getNextDeliveryDate } from './utils';
import { IDeliveryInput, DeliveryInput, DeliveryMeal, IDeliveryMeal } from './deliveryModel';
import { ICard } from '../card/cardModel';
import { IDestination } from '../place/destinationModel';
import { IConsumerPlan, ISchedule, Schedule, MealPlan, defaultDeliveryDay } from '../consumer/consumerPlanModel';
import { IMeal, Meal, CuisineType } from '../rest/mealModel';
import { state } from '../place/addressModel';
import moment from "moment";
import { isEqual } from 'lodash';
import { getItemChooser } from '../utils/utils';

const AUTO_ADDON_LIMIT = 3;

export interface ICartInput {
  readonly paymentMethodId: string
  readonly card: ICard
  readonly promo?: string
  readonly consumerPlan: Omit<IConsumerPlan, 'referralCode' | 'weeklyDiscounts'>
  readonly donationCount: number
  readonly phone: string
  readonly destination: IDestination
  readonly deliveries: IDeliveryInput[]
};

export type RestMeals = {
  [key: string]: {
    mealPlans: MealPlan[],
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

export class Cart implements ICart {
  readonly donationCount: number
  readonly deliveries: DeliveryInput[];
  readonly restMeals: RestMeals;
  readonly schedules: Schedule[];
  readonly zip: string | null;

  constructor(cart: ICart) {
    this.donationCount = cart.donationCount;
    this.deliveries = cart.deliveries.map(d => new DeliveryInput(d));
    this.restMeals = Object.entries(cart.restMeals).reduce<RestMeals>((map, [restId, data]) => {
      map[restId] = {
        mealPlans: data.mealPlans,
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

  public static addMealsToExistingDeliveryMeals = (newMeals: IDeliveryMeal[], existingMeals: IDeliveryMeal[]) => {
    newMeals.forEach(newMeal => {
      for (let i = 0; i < existingMeals.length; i++) {
        if (DeliveryMeal.isSameMeal(existingMeals[i], newMeal)) {
          existingMeals[i] = new DeliveryMeal({
            ...newMeal,
            quantity: existingMeals[i].quantity + 1,
          });
          return;
        }
      }
      existingMeals.push(newMeal);
    })
  }

  public static autoAddMealsToDeliveries(restMeals: RestMeals, deliveries: DeliveryInput[]) {
    Object.values(restMeals).forEach(restMeals => {
      const numMealsInRest = Cart.getRestMealCount(restMeals.mealPlans); // 9
      const getNextMeals = getNextMealsIterator(restMeals.meals);
      let numAddedMeals = 0;
      let meals;
      for (let i = 0; i < deliveries.length; i++) {
        const numMealsInDelivery = Cart.getNumMeals(deliveries[i].Meals);
        const numMealsNeededInDelivery = MIN_MEALS - numMealsInDelivery;
        let numRemainingMealsInRest = numMealsInRest - numAddedMeals;
        if (numMealsNeededInDelivery <= 0) continue;
        if (numRemainingMealsInRest > numMealsNeededInDelivery) {
          numRemainingMealsInRest -= numMealsNeededInDelivery;
          numAddedMeals += numMealsNeededInDelivery;
          meals = getNextMeals(numMealsNeededInDelivery);
        } else {
          meals = getNextMeals(numRemainingMealsInRest);
        }
        Cart.addMealsToExistingDeliveryMeals(meals, deliveries[i].Meals);
      }
      const remainingMeals = numMealsInRest - numAddedMeals;
      if (remainingMeals > 0) {
        let deliveryWithSameRest = -1;
        let deliveryWithDefaultDay = -1;
        for (let i = 0; i < deliveries.length; i++) {
          if (deliveryWithSameRest === -1) {
            if (deliveries[i].Meals.find(m => m.RestId === restMeals.meals[0].RestId)) {
              deliveryWithSameRest = i;
            }
          }
          if (moment(deliveries[i].DeliveryDate).day() === defaultDeliveryDay) {
            deliveryWithDefaultDay = i;
          }
        }
        const meals = getNextMeals(remainingMeals);
        if (deliveryWithSameRest > -1) {
          Cart.addMealsToExistingDeliveryMeals(meals, deliveries[deliveryWithSameRest].Meals);          
        } else if (deliveryWithDefaultDay > -1) {
          Cart.addMealsToExistingDeliveryMeals(meals, deliveries[deliveryWithDefaultDay].Meals);          
        } else {
          Cart.addMealsToExistingDeliveryMeals(meals, deliveries[0].Meals);          
        }
      }
    })
  }

  public static getDeliveriesFromSchedule(
    schedules: ISchedule[],
    start?: number,
    timezone?: string,
    dateModifier?: (m: moment.Moment) =>  moment.Moment
  ) {
    return schedules.map(s => {
      let deliveryDate = getNextDeliveryDate(s.day, start, timezone);
      if (dateModifier) {
        deliveryDate = dateModifier(deliveryDate);
      }
      return new DeliveryInput({
        deliveryTime: s.time,
        deliveryDate: deliveryDate.valueOf(),
        discount: null,
        meals: [],
      })
    })
  }

  public static getRestMealsPerDelivery(deliveries: DeliveryInput[]) {
    return deliveries.map(deliveryInput => deliveryInput.meals.reduce<RestMeals>((groupings, meal) => {
      Cart.addMealToRestMeals(groupings, meal);
      return groupings;
    }, {}))
  }

  public static addMealToRestMeals(
    restMeals: RestMeals,
    newMeal: IDeliveryMeal,
  ) {
    const restMeal = restMeals[newMeal.restId];
    if (restMeal) {
      const currMealPlans = restMeals[newMeal.restId].mealPlans;
      const currMealPlanIndex = currMealPlans.findIndex(m => m.StripePlanId === newMeal.stripePlanId);
      if (currMealPlanIndex === -1) {
        currMealPlans.push(new MealPlan({
          stripePlanId: newMeal.stripePlanId,
          planName: newMeal.planName,
          mealCount: newMeal.quantity,
        }))
      } else {
        currMealPlans[currMealPlanIndex] = new MealPlan({
          ...currMealPlans[currMealPlanIndex],
          mealCount: currMealPlans[currMealPlanIndex].MealCount + newMeal.quantity,
        })
      }
      const index = restMeal.meals.findIndex(meal => DeliveryMeal.isSameMeal(newMeal, meal));
      if (index === -1) {
        restMeal.meals.push(new DeliveryMeal(newMeal));
      } else {
        restMeal.meals[index] = new DeliveryMeal({
          ...newMeal,
          quantity: restMeal.meals[index].Quantity + newMeal.quantity
        });
      }
    } else {
      restMeals[newMeal.restId] = {
        mealPlans: [
          new MealPlan({
            stripePlanId: newMeal.stripePlanId,
            planName: newMeal.planName,
            mealCount: newMeal.quantity,
          })
        ],
        meals: [new DeliveryMeal(newMeal)]
      }
    }
  }

  public static getDeliveryMeals(
    meals: IMeal[],
    restId: string,
    restName: string,
    taxRate: number
  ) {
    return meals.reduce<DeliveryMeal[]>((groupings, meal) => {
      const choices: string[] = [];
      meal.optionGroups.forEach(og => choices.push(
        og.names[Math.floor(Math.random() * og.names.length)]
      ));
      meal.addonGroups.forEach(ag => {
        const limit = ag.limit || Math.min(AUTO_ADDON_LIMIT, ag.names.length);
        const chooseRandomly = getItemChooser<string>(ag.names);
        for (let i = 0; i < limit; i++) {
          choices.push(chooseRandomly());
        }
      })
      const deliveryMeal = DeliveryMeal.getDeliveryMeal(
        meal._id,
        meal,
        choices,
        restId,
        restName,
        taxRate
      );
      const groupIndex = groupings.findIndex(group => DeliveryMeal.isSameMeal(group, deliveryMeal));
      if (groupIndex === -1) {
        groupings.push(deliveryMeal);
      } else {
        groupings[groupIndex] = new DeliveryMeal({
          ...groupings[groupIndex],
          quantity: groupings[groupIndex].quantity + 1,
        })
      }
      return groupings;
    }, [])
  }

  public static getStandardMealCount(cart: Cart) {
    return Object.values(cart.RestMeals).reduce<number>((sum, data) => {
      const standardCount = data.mealPlans.find(p => p.PlanName === PlanNames.Standard)?.MealCount;
      sum = sum + (standardCount || 0);
      return sum;
    }, 0) + cart.DonationCount;
  }

  public static getAllowedDeliveries(cart: Cart) {
    return Math.max(
      Math.floor(Cart.getStandardMealCount(cart) / 4),
      1
    )
  }

  public static getRestMealCount(mealPlans: MealPlan[]) {
    return mealPlans.reduce((sum, p) => sum + p.MealCount, 0);
  }

  public static getNumMeals(meals: IDeliveryMeal[]) {
    return meals.reduce((sum, m) => sum + m.quantity, 0);
  }

  public static getCombinedMealPlans(restMeals: RestMeals, donationCount: number) {
    return Object.values(restMeals).reduce<{ [key: string]: MealPlan }>((sum, restMeal) => {
      restMeal.mealPlans.forEach(mp => {
        if (sum[mp.StripePlanId]) {
          sum[mp.StripePlanId] = new MealPlan({
            ...sum[mp.StripePlanId],
            mealCount: sum[mp.StripePlanId].MealCount + mp.MealCount,
          })
        } else {
          sum[mp.StripePlanId] = new MealPlan({
            ...mp,
            mealCount: mp.MealCount + (mp.PlanName === PlanNames.Standard ? donationCount : 0),
          });
        }
      }, {});
      return sum;
    }, {})
  }

  public setScheduleAndAutoDeliveries(schedules: Schedule[], start?: number) {
    // we do this so that if a customer decides to add/remove meals AFTER setting deliveries, that
    // we don't 'reset' their preferred deliveries
    if (Schedule.equalsLists(schedules, this.Schedules) && this.Deliveries.length > 1) {
      return this;
    }
    const newCart = new Cart({
      ...this,
      schedules,
      deliveries: Cart.getDeliveriesFromSchedule(schedules, start),
    });
    Cart.autoAddMealsToDeliveries(this.restMeals, newCart.deliveries);
    return newCart;
  }

  public addMeal(
    mealId: string,
    newMeal: Meal | DeliveryMeal,
    choices: string[],
    restId: string,
    restName: string,
    taxRate: number,
  ) {
    const newCart = new Cart(this);
    const deliveryMeal = DeliveryMeal.getDeliveryMeal(
      mealId,
      newMeal,
      choices,
      restId,
      restName,
      taxRate
    );
    Cart.addMealToRestMeals(newCart.RestMeals, deliveryMeal);
    if (newCart.Deliveries.length > 0) {
      const firstDelivery = newCart.Deliveries[0];
      const newMealIndex = firstDelivery.meals.findIndex(m => m.MealId === mealId && isEqual(choices, m.Choices));
      if (newMealIndex === -1) {
        firstDelivery.Meals.push(
          DeliveryMeal.getDeliveryMeal(
            mealId,
            newMeal,
            choices,
            restId,
            restName,
            taxRate,
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
    promo?: string,
  ): ICartInput {
    const mealPlans = Object.values(this.restMeals).reduce<MealPlan[]>((plans, restMeal) => {
      restMeal.mealPlans.forEach(mp => {
        const planIndex = plans.findIndex(p => mp.StripePlanId === p.StripePlanId);
        if (planIndex === -1) {
          plans.push(mp)
        } else {
          plans[planIndex] = new MealPlan({
            ...mp,
            mealCount: plans[planIndex].MealCount + mp.MealCount
          });
        }
      });
      return plans;
    }, []);

    if (this.DonationCount > 0) {
      const standardPlanIndex = mealPlans.findIndex(p => p.PlanName === PlanNames.Standard);
      if (standardPlanIndex > -1) {
        mealPlans[standardPlanIndex] = new MealPlan({
          ...mealPlans[standardPlanIndex],
          mealCount: mealPlans[standardPlanIndex].MealCount + this.DonationCount,
        });
      }
    }
    return {
      donationCount: this.DonationCount,
      paymentMethodId,
      card,
      phone,
      promo,
      consumerPlan: {
        mealPlans,
        schedules: this.Schedules,
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
    const fromMealIndex = fromDeliveryMeals.findIndex(m => DeliveryMeal.isSameMeal(m, meal));
    if (meal.Quantity > 1) {
      fromDeliveryMeals[fromMealIndex] = new DeliveryMeal({
        ...meal,
        quantity: meal.Quantity - 1,
      });
    } else {
      fromDeliveryMeals.splice(fromMealIndex, 1);
    }
    const newDeliveryMeals = newCart.Deliveries[toDeliveryIndex].Meals;
    const toMealIndex = newDeliveryMeals.findIndex(m => DeliveryMeal.isSameMeal(m, meal));
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

  public removeMeal(restId: string, removalMeal: IDeliveryMeal) {
    const newCart = new Cart(this);
    const restMeals = newCart.RestMeals[restId];
    const index = restMeals.meals.findIndex(meal => DeliveryMeal.isSameMeal(meal, removalMeal));
    if (index === -1) {
      const err = new Error(`MealId '${removalMeal.mealId + removalMeal.choices.join(', ')}' not found in cart`);
      console.error(err.stack);
      throw err;
    }
    const targetMeal = restMeals.meals[index];
    const currMealPlans = newCart.RestMeals[restId].mealPlans;
    const currMealPlanIndex = currMealPlans.findIndex(m => m.StripePlanId === targetMeal.StripePlanId);
    if (currMealPlanIndex === -1) {
      const err = new Error(`Mealplan '${targetMeal.StripePlanId}' not found in cart`);
      console.error(err.stack);
      throw err;
    } else {
      currMealPlans[currMealPlanIndex] = new MealPlan({
        ...currMealPlans[currMealPlanIndex],
        mealCount: currMealPlans[currMealPlanIndex].MealCount - 1,
      })
    }

    if (targetMeal.Quantity === 1) {
      restMeals.meals.splice(index, 1);
    } else {
      restMeals.meals[index] = new DeliveryMeal({
        ...targetMeal,
        quantity: targetMeal.Quantity - 1,
      })
    }
    
    if (currMealPlans[currMealPlanIndex].MealCount === 0) {
      currMealPlans.splice(currMealPlanIndex, 1);
      if (currMealPlans.length === 0) {
        delete newCart.RestMeals[restId];
      }
    }

    let removedMealDeliveryIndex = -1;
    let removedMealMealsIndex = -1;

    for (let i = 0; i < newCart.Deliveries.length; i++) {
      const meals = newCart.Deliveries[i].Meals;
      for (let j = 0; j < meals.length; j++) {
        if (DeliveryMeal.isSameMeal(meals[j], removalMeal)) {
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