import { IDiscount, Discount } from './discountModel';
import { IMealPrice, MealPrice } from './orderModel';
import { IDeliveryInput } from './deliveryModel';
import { IPromo, Promo } from './promoModel';

export const deliveryFee = 350;
export const competitorMealPrice = 16;

export interface ICost {
  readonly tax: number
  readonly tip: number
  readonly mealPrices: IMealPrice[]
  readonly promos: IPromo[]
  readonly discounts: IDiscount[]
  readonly percentFee: number
  readonly flatRateFee: number
  readonly deliveryFee: number
}

export class Cost implements ICost {
  readonly tax: number
  readonly tip: number
  readonly discounts: Discount[]
  readonly mealPrices: MealPrice[]
  readonly promos: Promo[]
  readonly percentFee: number
  readonly flatRateFee: number
  readonly deliveryFee: number

  constructor(cost: ICost) {
    this.tax = cost.tax;
    this.tip = cost.tip;
    this.discounts = cost.discounts.map(d => new Discount(d));
    this.mealPrices = cost.mealPrices.map(mp => new MealPrice(mp));
    this.percentFee = cost.percentFee;
    this.flatRateFee = cost.flatRateFee;
    this.deliveryFee = cost.deliveryFee;
    this.promos = cost.promos.map(p => new Promo(p));
  }

  public get Tax() { return this.tax }
  public get Tip() { return this.tip }
  public get Discounts() { return this.discounts }
  public get MealPrices() { return this.mealPrices }
  public get PercentFee() { return this.percentFee }
  public get FlatRateFee() { return this.flatRateFee }
  public get DeliveryFee() { return this.deliveryFee }
  public get Promos() { return this.promos }

  public static getICopy(c: ICost) {
    return {
      ...c,
      mealPrices: c.mealPrices.map(mp => MealPrice.getICopy(mp)),
      promos: c.promos.map(p => Promo.getICopy(p)),
      discounts: c.discounts.map(d => Discount.getICopy(d)),
    }
  }

  public static getDeliveryFee(deliveries: IDeliveryInput[]) {
    if (deliveries.length === 0) return 0;
    return (deliveries.length - 1) * deliveryFee
  }

  public static getTaxes(deliveries: IDeliveryInput[], mealPrices: IMealPrice[]) {
    let maxTaxRate = 0
    const foodTax = deliveries.reduce<number>((taxes, d) => 
      taxes + d.meals.reduce<number>((sum, m) => {
        maxTaxRate = Math.max(m.taxRate, maxTaxRate);
        const mealPrice = mealPrices.find(mp => mp.stripePlanId === m.stripePlanId);
        if (!mealPrice) {
          const err = new Error(`Could not find meal price for stripePlanId '${m.stripePlanId}'`);
          console.error(err.stack);
          throw err;
        }
        return sum + (m.taxRate * mealPrice.mealPrice * m.quantity)
      }, 0)
    , 0);
    const deliveryTax = Cost.getDeliveryFee(deliveries) * maxTaxRate;
    return Math.round(deliveryTax + foodTax);
  }
}

export interface ISpent {
  readonly amount: number
  readonly numMeals: number
  readonly numOrders: number
}

export class Spent {
  readonly amount: number
  readonly numMeals: number
  readonly numOrders: number
  
  constructor(s: ISpent) {
    this.amount = s.amount;
    this.numMeals = s.numMeals;
    this.numOrders = s.numOrders;
  }

  public get Amount() { return this.amount }
  public get NumMeals() { return this.numMeals }
  public get NumOrders() { return this.numOrders }

}