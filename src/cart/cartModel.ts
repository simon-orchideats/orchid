import { deliveryDay } from './../consumer/consumerModel';
import { IMeal, Meal } from '../rest/mealModel';

export interface ICart {
  readonly meals: IMeal[];
  readonly restId: string | null;
  readonly planId: string | null;
  readonly deliveryDay: deliveryDay | null;
  readonly zip: string | null;
}

export class Cart implements ICart {
  readonly meals: Meal[]
  readonly restId: string | null
  readonly planId: string | null
  readonly deliveryDay: deliveryDay | null
  readonly zip: string | null;

  constructor(cart: ICart) {
    this.meals = cart.meals.map(meal => new Meal(meal));
    this.restId = cart.restId;
    this.planId = cart.planId;
    this.deliveryDay = cart.deliveryDay;
    this.zip = cart.zip;
  }

  public get DeliveryDay() { return this.deliveryDay }
  public get Meals() { return this.meals }
  public get PlanId() { return this.planId }
  public get RestId() { return this.restId }
  public get Zip() { return this.zip }

  public getGroupedMeals() {
    return this.meals.reduce<{
      count: number,
      meal: Meal,
    }[]>((groupings, meal) => {
      const groupIndex = groupings.findIndex(group => group.meal.Id === meal.Id);
      if (groupIndex === -1) {
        groupings.push({
          count: 1,
          meal,
        })
      } else {
        groupings[groupIndex].count++;
      }
      return groupings;
    }, []);
  }

  public addMeal(meal: Meal) {
    const newCart = new Cart(this);
    newCart.meals!.push(meal);
    return newCart;
  }

  public removeMeal(mealId: string) {
    const newCart = new Cart(this);
    const index = newCart.Meals.findIndex(meal => meal.Id === mealId);
    if (index === -1) {
      throw new Error(`MealId '${mealId}' not found in cart`);
    }
    newCart.Meals.splice(index, 1);
    return newCart;
  }

}