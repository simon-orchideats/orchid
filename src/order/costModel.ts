import { ICartInput } from './cartModel';
import { IDiscount, Discount } from './discountModel';


export interface ICost {
  readonly tip: number
  readonly deliveryFee: number
  readonly discount: IDiscount | null;
  readonly taxRate: number
}

export class Cost {
  public static getICopy(c: ICost): ICost {
    return {
      tip: c.tip,
      deliveryFee: c.deliveryFee,
      discount: c.discount ? Discount.getICopy(c.discount) : null,
      taxRate: c.taxRate,
    }
  }

  public static getICost(c: ICartInput): ICost {
    return {
      tip: c.tip,
      deliveryFee: c.cartOrder.rest.deliveryFee,
      discount: c.cartOrder.rest.discount ? Discount.getICopy(c.cartOrder.rest.discount) : null,
      taxRate: c.cartOrder.rest.taxRate,
    }
  }
  // public static getDeliveryFee(deliveries: IDeliveryInput[]) {
  // }

  // public static getRestTaxes(deliveries: IDeliveryInput[], mealPrices: IMealPrice[]) {
  // }
}
