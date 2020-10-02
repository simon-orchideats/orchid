import { IMeal, Meal } from "../rest/mealModel";
import { Tag } from "../rest/tagModel";
import { differenceBy } from "lodash";
import { ICartRest } from "./cartModel";

export interface ICustomization {
  additionalPrice: number
  name: string
  quantity?: number
}

export class Customization {
  static getICopy(c: ICustomization): ICustomization {
    return {
      additionalPrice: c.additionalPrice,
      name: c.name,
      quantity: c.quantity,
    }
  }

  static getKey(c: ICustomization): string {
    const q = c.quantity === undefined ? '' : c.quantity
    return c.name + q;
  }
}

export interface IOrderMeal extends Omit<
  IMeal,
  '_id'
  | 'addonGroups'
  | 'optionGroups'
  | 'isActive'
  > {
  readonly customizations: ICustomization[]
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
  
  static getKey(meal: IOrderMeal) { return meal.mealId + meal.customizations.map(Customization.getKey).join() + meal.instructions }

  public static equals(m1: IOrderMeal, m2: IOrderMeal) {
    return m1.mealId === m2.mealId
      && (differenceBy(m1.customizations, m2.customizations, Customization.getKey).length === 0 && differenceBy(m2.customizations, m1.customizations, Customization.getKey).length === 0)
      && m1.instructions === m2.instructions;
  }

  static getICopy(meal: IOrderMeal): IOrderMeal {
    return {
      ...meal,
      customizations: meal.customizations.map(c => c),
      tags: meal.tags.map(t => Tag.getICopy(t))
    }
  }

  static getIOrderMealFromIMeal(
    customizations: ICustomization[],
    instructions: string | null,
    meal: IMeal,
  ): IOrderMeal {
    const m = Meal.getICopy(meal);
    return {
      customizations: customizations.map(c => Customization.getICopy(c)),
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
}

export class OrderRest {
  static getICopy(orderRest: IOrderRest) {
    return {
      meals: orderRest.meals.map(m => OrderMeal.getICopy(m)),
      restId: orderRest.restId,
      restName: orderRest.restName,
    }
  }

  static getNumMeals(r: IOrderRest): number {
    return r.meals.reduce((sum, m) => sum + m.quantity, 0);
  }

  static getIOrderRest(cartRest: ICartRest): IOrderRest {
    return {
      meals: cartRest.meals,
      restId: cartRest.restId,
      restName: cartRest.restName,
    }
  }
}