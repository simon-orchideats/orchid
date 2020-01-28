import { Plan } from "../../plan/planModel";

export const getSuggestion = (currCount: number, plans?: Plan[]) => {
  if (!plans) return '';
  for (let i = 0; i < plans.length; i++) {
    const mealCount = plans[i].MealCount;
    if (currCount < mealCount) return `Add ${mealCount - currCount} more for ${plans[i].MealPrice.toFixed(2)} per meal`;
    if (currCount === mealCount && i === plans.length - 1) return '';
    if (currCount > mealCount && i === plans.length - 1) return `Remove ${currCount - mealCount}`;
  }
}
