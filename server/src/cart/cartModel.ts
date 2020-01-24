import { IMeal, Meal } from '../rest/mealModel';

export interface ICart {
  readonly meals: IMeal[];
  readonly restId: string | null;
  readonly planId: string | null;
}

export class Cart implements ICart {
  readonly meals: Meal[];
  readonly restId: string | null
  readonly planId: string | null

  constructor(cart: ICart) {
    this.meals = cart.meals.map(meal => new Meal(meal));
    this.restId = cart.restId;
    this.planId = cart.planId;
  }

  public get Meals() { return this.meals }
  public get PlanId() { return this.planId }
  public get RestId() { return this.restId }

  public addMeal(meal: Meal) {
    const newCart = new Cart(this);
    newCart.meals.push(meal);
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