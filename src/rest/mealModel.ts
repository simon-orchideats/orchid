export interface IMeal {
  readonly _id: string,
  readonly img: string,
  readonly name: string
}

export class Meal implements IMeal {
  readonly _id: string;
  readonly img: string;
  readonly name: string;

  constructor(meal: IMeal) {
    this._id = meal._id;
    this.img = meal.img;
    this.name = meal.name;
  }

  public get Id() { return this._id }
  public get Img() { return this.img }
  public get Name() { return this.name }
}