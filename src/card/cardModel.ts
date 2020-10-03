export interface ICard {
  readonly last4: string
  readonly expMonth: number
  readonly expYear: number
}

export class Card {
  
  static getHiddenCardStr(c: ICard) {
    return `${c.last4} ${c.expMonth}/${c.expYear}`
  }

  static getCardFromStripe(card?: stripe.paymentMethod.PaymentMethodCard) {
    if (!card) {
      const err = new Error('No card');
      console.error(err.stack);
      throw err;
    }
    return {
      last4: card.last4,
      expMonth: card.exp_month,
      expYear: card.exp_year,
    }
  }

  static getICopy(card: ICard): ICard {
    return {
      last4: card.last4,
      expMonth: card.expMonth,
      expYear: card.expYear,
    }
  }
}