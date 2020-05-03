import { IMealPrice } from './orderModel';
import { IDeliveryInput } from './deliveryModel';
export interface ICost {
  tax: number
  tip: number
  mealPrices: IMealPrice[]
  percentFee: number
  flatRateFee: number
  deliveryFee: number
}

export class Cost {

  public static getDeliveryFee(deliveries: IDeliveryInput[]) {
    return (deliveries.length - 1) * deliveryFee
  }

  public static getTaxes(deliveries: IDeliveryInput[], mealPrices: IMealPrice[]) {
    return Math.round(deliveries.reduce<number>((taxes, d) => 
      taxes + d.meals.reduce<number>((sum, m) => {
        const mealPrice = mealPrices.find(mp => mp.stripePlanId === m.stripePlanId);
        if (!mealPrice) {
          const err = new Error(`Could not find meal price for stripePlanId '${m.stripePlanId}'`);
          console.error(err.stack);
          throw err;
        }
        return sum + (m.taxRate * mealPrice.mealPrice * m.quantity)
      }, 0)
    , 0));
  }
  
}

export const deliveryFee = 350;
