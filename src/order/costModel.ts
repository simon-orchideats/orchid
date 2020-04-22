import { IMealPrice } from './orderModel';
export interface ICost {
  tax: number
  tip: number
  mealPrices: IMealPrice[]
  percentFee: number
  flatRateFee: number
}