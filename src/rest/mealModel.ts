import { IOrderMeal } from './../order/orderRestModel';
import { ITag, Tag } from './tagModel';

export interface IChoice {
  name: string
  additionalPrice: number
}

export class Choice {
  static getICopy(o: IChoice): IChoice {
    return {
      name: o.name,
      additionalPrice: o.additionalPrice,
    }
  }
}

export interface IAddonGroup {
  readonly limit?: number
  readonly canRepeat: boolean
  readonly name: string | null
  readonly addons: IChoice[]
}

export class AddonGroup {
  public static getICopy(ag: IAddonGroup): IAddonGroup {
    return {
      limit: ag.limit,
      name: ag.name,
      canRepeat: ag.canRepeat,
      addons: ag.addons.map(c => Choice.getICopy(c)),
    }
  }
}

export interface IOptionGroup {
  readonly name: string | null
  readonly options: IChoice[]
}

export class OptionGroup {
  static getICopy(og: IOptionGroup): IOptionGroup {
    return {
      name: og.name,
      options: og.options.map(c => Choice.getICopy(c)),
    }
  }
}

export interface IComparison {
  readonly compareTo: string
  readonly percentOff: number
  readonly serviceFeePercent: number
}

export interface EComparison extends IComparison {
  readonly comparisonDate: number
}

export class Comparison {
  static getICopy(c: IComparison): IComparison {
    return {
      compareTo: c.compareTo,
      percentOff: c.percentOff,
      serviceFeePercent: c.serviceFeePercent,
    }
  }
}

export interface IMeal {
  readonly addonGroups: IAddonGroup[],
  readonly comparison: IComparison | null,
  readonly description: string | null
  readonly _id: string,
  readonly img?: string,
  readonly isActive: boolean
  readonly name: string,
  readonly optionGroups: IOptionGroup[],
  readonly price: number
  readonly tags: ITag[]
}

export interface IMealInput extends Omit<IMeal, '_id'> {}

export class Meal {
  static getICopy(meal: IMeal): IMeal {
    return {
      _id: meal._id,
      img: meal.img,
      comparison: meal.comparison && Comparison.getICopy(meal.comparison),
      isActive: meal.isActive,
      name: meal.name,
      description: meal.description,
      price: meal.price,
      tags: meal.tags.map(t => Tag.getICopy(t)),
      addonGroups: meal.addonGroups.map(ag => AddonGroup.getICopy(ag)),
      optionGroups: meal.optionGroups.map(og => OptionGroup.getICopy(og))
    }
  }

  static getRoundedBadPrice(meal: IMeal | IOrderMeal, quantity: number): number {
    let badPrice = meal.price * quantity;

    if (meal.comparison) {
      if (meal.comparison.percentOff) {
        badPrice = badPrice / (1 - meal.comparison.percentOff / 100);
      }
  
      if (meal.comparison.serviceFeePercent) {
        badPrice = badPrice * (1 + (meal.comparison.serviceFeePercent / 100));
      }
    }
    return Math.round(badPrice);
  }

  static getTotalBadPrice(meals: IOrderMeal[]): number {
    return meals.reduce((sum, m) => sum + Meal.getRoundedBadPrice(m, m.quantity), 0)
  }
}
