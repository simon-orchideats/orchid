import { IMeal, Meal } from './../meal/mealModel';

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
  public addMeal(meal: Meal) {
    const newCart = new Cart(this);
    newCart.meals.push(meal);
    return newCart;
  }
  public get RestId() { return this.restId }
  public get PlanId() { return this.planId }
}