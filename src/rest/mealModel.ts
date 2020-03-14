export interface IMeal {
  readonly _id: string,
  readonly img: string,
  readonly name: string,
  readonly description: string
  readonly originalPrice: number
}

export class Meal implements IMeal {
  readonly _id: string;
  readonly img: string;
  readonly name: string;
  readonly description: string;
  readonly originalPrice: number;

  constructor(meal: IMeal) {
    this._id = meal._id;
    this.img = meal.img;
    this.name = meal.name;
    this.description = meal.description;
    this.originalPrice = meal.originalPrice
  }

  public get Id() { return this._id }
  public get Img() { return this.img }
  public get Name() { return this.name }
  public get Description() { return this.description }
  public get OriginalPrice() { return this.originalPrice }

  static getICopy(meal: IMeal): IMeal {
    return {
      ...meal
    }
  }
}
