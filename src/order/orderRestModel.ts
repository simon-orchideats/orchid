import { IMeal, Meal } from "../rest/mealModel";
import { Tag } from "../rest/tagModel";
import { difference } from "lodash";

export interface IOrderMeal extends Omit<
  IMeal,
  '_id'
  | 'addonGroups'
  | 'optionGroups'
  | 'isActive'
  > {
  readonly choices: string[]
  readonly instructions: string | null
  readonly mealId: string
  readonly quantity: number
}

export class OrderMeal {

  static decrementQuantity(m: IOrderMeal) {
    return {
      ...OrderMeal.getICopy(m),
      quantity: m.quantity - 1,
    }
  }
  
  static getKey(meal: IOrderMeal) { return meal.mealId + meal.choices.join() + meal.instructions }

  public static equals(m1: IOrderMeal, m2: IOrderMeal) {
    return m1.mealId === m2.mealId
      && (difference(m1.choices, m2.choices).length === 0 || difference(m2.choices, m1.choices).length === 0)
      && m1.instructions === m2.instructions;
  }

  static getICopy(meal: IOrderMeal): IOrderMeal {
    return {
      ...meal,
      choices: meal.choices.map(c => c),
      tags: meal.tags.map(t => Tag.getICopy(t))
    }
  }

  static getIOrderMealFromIMeal(
    choices: string[],
    instructions: string | null,
    meal: IMeal,
  ): IOrderMeal {
    const m = Meal.getICopy(meal);
    return {
      choices,
      description: m.description,
      img: m.img,
      instructions,
      mealId: m._id,
      name: m.name,
      quantity: 1,
      price: m.price,
      tags: m.tags,
    }
  }

  static incrementQuantity(m: IOrderMeal): IOrderMeal {
    return {
      ...OrderMeal.getICopy(m),
      quantity: m.quantity + 1,
    }
  }

  static setInstructions(m: IOrderMeal, instructions: string | null): IOrderMeal {
    return {
      ...OrderMeal.getICopy(m),
      instructions,
    }
  }

  static getTotalMealCost(meals: IOrderMeal[]) {
    return meals.reduce((sum, m) => sum + m.price * m.quantity, 0);
  }
}

export interface IOrderRest {
  readonly meals: IOrderMeal[]
  readonly restId: string
  readonly restName: string
  readonly stripeRestId: string
}

export class OrderRest {
  static getICopy(orderRest: IOrderRest) {
    return {
      meals: orderRest.meals.map(m => OrderMeal.getICopy(m)),
      restId: orderRest.restId,
      restName: orderRest.restName,
      stripeRestId: orderRest.stripeRestId,
    }
  }

  static getNumMeals(r: IOrderRest): number {
    return r.meals.reduce((sum, m) => sum + m.quantity, 0);
  }

}