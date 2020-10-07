import { ICartInput } from './cartModel';

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

  public static getICost(c: ICartInput) {
    return {
      additionalOrderFee: 0,
      onDemandFee: 0,
      tip: c.tip,
      deliveryFee: c.cartOrder.rest.deliveryFee,
      taxRate: c.cartOrder.rest.taxRate,
    }
  }
  // public static getDeliveryFee(deliveries: IDeliveryInput[]) {
  // }

  // public static getRestTaxes(deliveries: IDeliveryInput[], mealPrices: IMealPrice[]) {
  // }
}
