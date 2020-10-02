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
  readonly name: string
  readonly addons: IChoice[]
}

export class AddonGroup {
  public static getICopy(ag: IAddonGroup) {
    return {
      limit: ag.limit,
      name: ag.name,
      addons: ag.addons.map(c => Choice.getICopy(c)),
    }
  }
}

export interface IOptionGroup {
  readonly name: string
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

export interface IMeal {
  readonly addonGroups: IAddonGroup[],
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
      isActive: meal.isActive,
      name: meal.name,
      description: meal.description,
      price: meal.price,
      tags: meal.tags.map(t => Tag.getICopy(t)),
      addonGroups: meal.addonGroups.map(ag => AddonGroup.getICopy(ag)),
      optionGroups: meal.optionGroups.map(og => OptionGroup.getICopy(og))
    }
  }
}
