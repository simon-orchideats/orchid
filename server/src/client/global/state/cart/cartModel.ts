export interface ICart {
  readonly plan: string[];
}

export class Cart implements ICart {
  readonly plan: string[];

  constructor(cart: ICart) {
    this.plan = cart.plan;
  }

  public get Plan() { return this.plan }
}