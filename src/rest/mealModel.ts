import { ITag, Tag } from './tagModel';
import { PlanName } from './../plan/planModel';

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
  readonly _id: string,
  readonly img?: string,
  readonly name: string,
  readonly addonGroups: IAddonGroup[],
  readonly optionGroups: IOptionGroup[],
  readonly isActive: boolean
  readonly description: string
  readonly originalPrice: number
  readonly stripePlanId: string
  readonly planName: PlanName
  readonly tags: ITag[]
}

export interface IMealInput extends Omit<IMeal, 'planName' | 'stripePlanId' | '_id'> {}

export interface EMeal extends IMeal {
  readonly canAutoPick: boolean
}

export class Meal implements IMeal {
  readonly _id: string;
  readonly img?: string;
  readonly isActive: boolean
  readonly addonGroups: AddonGroup[]
  readonly optionGroups: OptionGroup[]
  readonly name: string;
  readonly description: string;
  readonly originalPrice: number;
  readonly stripePlanId: string;
  readonly planName: PlanName;
  readonly tags: Tag[];

  constructor(meal: IMeal) {
    this._id = meal._id;
    this.isActive = meal.isActive;
    this.addonGroups = meal.addonGroups.map(ag => new AddonGroup(ag))
    this.img = meal.img;
    this.name = meal.name;
    this.description = meal.description;
    this.originalPrice = meal.originalPrice;
    this.optionGroups = meal.optionGroups.map(og => new OptionGroup(og))
    this.stripePlanId = meal.stripePlanId;
    this.planName = meal.planName;
    this.tags = meal.tags.map(t => new Tag(t));
  }

  public get Id() { return this._id }
  public get IsActive() { return this.isActive }
  public get AddonGroups() { return this.addonGroups }
  public get Img() { return this.img }
  public get Name() { return this.name }
  public get OptionGroups() { return this.optionGroups }
  public get Description() { return this.description }
  public get OriginalPrice() { return this.originalPrice }
  public get StripePlanId() { return this.stripePlanId }
  public get PlanName() { return this.planName }
  public get Tags() { return this.tags }

  static getICopy(meal: IMeal): IMeal {
    return {
      ...meal,
      addonGroups: meal.addonGroups.map(ag => AddonGroup.getICopy(ag)),
      optionGroups: meal.optionGroups.map(og => OptionGroup.getICopy(og))
    }
  }
}
