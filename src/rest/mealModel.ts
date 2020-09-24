import { ITag, Tag } from './tagModel';

export interface IOptionGroup {
  readonly names: string[]
}

export class OptionGroup implements IOptionGroup {
  readonly names: string[]

  constructor(choice: IOptionGroup) {
    this.names = [...choice.names];
  }

  public get Names() { return this.names }

  public static getICopy(cg: IOptionGroup) {
    return {
      names: [...cg.names]
    }
  }
}

export interface IAddonGroup extends IOptionGroup {
  readonly limit?: number
}

export class AddonGroup extends OptionGroup implements IAddonGroup {
  readonly limit?: number

  constructor(choice: IAddonGroup) {
    super(choice);
    this.limit = choice.limit;
  }

  public get Limit() { return this.limit }

  public static getICopy(cg: IAddonGroup) {
    return {
      names: [...cg.names],
      limit: cg.limit,
    }
  }
}

export interface IMeal {
  readonly addonGroups: IAddonGroup[],
  readonly description: string
  readonly _id: string,
  readonly img?: string,
  readonly isActive: boolean
  readonly name: string,
  readonly optionGroups: IOptionGroup[],
  readonly price: number
  readonly tags: ITag[]
}

export interface IMealInput extends Omit<IMeal, '_id'> {}

export class Meal implements IMeal {
  readonly _id: string;
  readonly img?: string;
  readonly isActive: boolean
  readonly addonGroups: AddonGroup[]
  readonly optionGroups: OptionGroup[]
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly tags: Tag[];

  constructor(meal: IMeal) {
    this._id = meal._id;
    this.isActive = meal.isActive;
    this.addonGroups = meal.addonGroups.map(ag => new AddonGroup(ag))
    this.img = meal.img;
    this.name = meal.name;
    this.description = meal.description;
    this.price = meal.price;
    this.optionGroups = meal.optionGroups.map(og => new OptionGroup(og))
    this.tags = meal.tags.map(t => new Tag(t));
  }

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
