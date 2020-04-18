import { IMealPrice } from './orderModel';
export interface ICost {
  tax: number
  tip: number
  total: number
  mealPrices: IMealPrice[]
  percentFee: number
  flatRateFee: number
}