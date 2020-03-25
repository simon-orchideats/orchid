export interface ICard {
  readonly last4: string
  readonly expMonth: number
  readonly expYear: number
}

export class Card implements ICard {
  readonly last4: string
  readonly expMonth: number
  readonly expYear: number

  constructor(card: ICard) {
    this.last4 = card.last4;
    this.expMonth = card.expMonth;
    this.expYear = card.expYear;
  }

  public get Last4() { return this.last4 };
  public get ExpMonth() { return this.expMonth };
  public get ExpYear() { return this.expYear };
  
  public getHiddenCardStr() {
    return `${this.last4} ${this.expMonth}/${this.expYear}`
  }

  static getCardFromStripe(card?: stripe.paymentMethod.PaymentMethodCard) {
    if (!card) {
      const err = new Error('No card');
      console.error(err.stack);
      throw err;
    }
    return new Card({
      last4: card.last4,
      expMonth: card.exp_month,
      expYear: card.exp_year,
    });
  }

  static getICopy(card: ICard): ICard {
    return {
      last4: card.last4,
      expMonth: card.expMonth,
      expYear: card.expYear,
    }
  }
}