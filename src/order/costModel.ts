import { ICartRest } from './cartModel';

export const ADDITIONAL_ORDER_FEE = 199;
export const ON_DEMAND_FEE = 199;

export interface ICost {
  readonly additionalOrderFee: number
  readonly onDemandFee: number
  readonly tip: number
  readonly deliveryFee: number
  readonly taxRate: number
}

export class Cost {
  public static getICopy(c: ICost) {
    return {
      additionalOrderFee: c.additionalOrderFee,
      onDemandFee: c.onDemandFee,
      tip: c.tip,
      deliveryFee: c.deliveryFee,
      taxRate: c.taxRate,
    }
  }

  public static getICost(r: ICartRest) {
    return {
      // todo pivot: these shoulnd't be 0s
      additionalOrderFee: 0,
      onDemandFee: 0,
      tip: 0,
      deliveryFee: r.deliveryFee,
      taxRate: r.taxRate,
    }
  }
  // public static getDeliveryFee(deliveries: IDeliveryInput[]) {
  // }

  // public static getRestTaxes(deliveries: IDeliveryInput[], mealPrices: IMealPrice[]) {
  // }
}
