export interface ICost {
  tax: number
  tip: number
  // null mealPrice when an order has no meals
  mealPrice: number | null
  total: number
  percentFee: number
  flatRateFee: number
}