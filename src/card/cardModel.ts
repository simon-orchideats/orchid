export interface ICard {
  readonly _id: string
  readonly last4: string
  readonly expMonth: number
  readonly expYear: number
}

export class Card implements ICard {
  readonly _id: string
  readonly last4: string
  readonly expMonth: number
  readonly expYear: number

  constructor(card: ICard) {
    this._id = card._id;
    this.last4 = card.last4;
    this.expMonth = card.expMonth;
    this.expYear = card.expYear;
  }

  public get Id() { return this._id };
  public get HiddenNumber() { return `**** ${this.Last4}`}
  public get Last4() { return this.last4 };
  public get ExpMonth() { return this.expMonth };
  public get ExpYear() { return this.expYear };
}