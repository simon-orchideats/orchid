import { PlanName } from './../plan/planModel';
export interface IMeal {
  readonly _id: string,
  readonly img?: string,
  readonly name: string,
  readonly description: string
  readonly originalPrice: number
  readonly stripePlanId: string
  readonly planName: PlanName
  readonly tags: string[]
}

export class Meal implements IMeal {
  readonly _id: string;
  readonly img?: string;
  readonly name: string;
  readonly description: string;
  readonly originalPrice: number;
  readonly stripePlanId: string;
  readonly planName: PlanName;
  readonly tags: string[];

  constructor(meal: IMeal) {
    this._id = meal._id;
    this.img = meal.img;
    this.name = meal.name;
    this.description = meal.description;
    this.originalPrice = meal.originalPrice;
    this.stripePlanId = meal.stripePlanId;
    this.planName = meal.planName;
    this.tags = meal.tags;
  }

  public get Id() { return this._id }
  public get Img() { return this.img }
  public get Name() { return this.name }
  public get Description() { return this.description }
  public get OriginalPrice() { return this.originalPrice }
  public get StripePlanId() { return this.stripePlanId }
  public get PlanName() { return this.planName }
  public get Tags() { return this.tags }

  static getICopy(meal: IMeal): IMeal {
    return {
      ...meal
    }
  }
}
