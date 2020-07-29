import { useGetCart, useIncrementCartDonationCount, useDecrementCartDonationCount } from "../global/state/cartState";
import { useGetAvailablePlans } from "../../plan/planService";
import withClientApollo from "../utils/withClientApollo";
import { Cart } from "../../order/cartModel";
import Router, { useRouter } from 'next/router'
import { upcomingDeliveriesRoute } from "../../pages/consumer/upcoming-deliveries";
import { deliveryRoute } from "../../pages/delivery";
import { useGetConsumer } from "../../consumer/consumerService";
import { Tier, MIN_MEALS, PlanNames, Plan } from "../../plan/planModel";
import { planAheadRoute } from "../../pages/plan-ahead"

export const getSuggestion = (cart: Cart | null, minMeals: number, cost: number) => {
  if (!cart) return [];
  let suggestion: string[] = [];
  const mealCount = Cart.getStandardMealCount(cart)
  if (mealCount < minMeals) {
    suggestion.push(`Need ${minMeals - mealCount} more meals for ${(cost / 100).toFixed(2)} ea`);
  }
  return suggestion;
}

type summary = {
  meals: string,
  price: string,
  isActive: boolean,
};

const MenuCart: React.FC<{
  render: (
    cart: Cart | null,
    disabled: boolean | undefined,
    onNext: () => void,
    suggestions: string[],
    summary: summary[][],
    donationCount: number,
    incrementDonationCount: () => void,
    decremetnDonationCount: () => void,
    title: string,
    confirmText: string, 
  ) => React.ReactNode
}> = ({
  render
}) => {
  const cart = useGetCart();
  const plans = useGetAvailablePlans();
  const consumer = useGetConsumer();
  const donationCount = cart ? cart.DonationCount : 0;
  const urlQuery = useRouter().query;
  const updatingParam = urlQuery.updating;
  const isUpdating = !!updatingParam && updatingParam === 'true'
  const orderId = urlQuery.orderId as string
  const limit = parseFloat(urlQuery.limit as string)
  const start = parseFloat(urlQuery.start as string)
  const upcomingDeliveriesPath = {
    pathname: upcomingDeliveriesRoute,
    query: { updating: 'true' }
  }
  const onNext = () => {
    if (!cart) {
      const err = new Error('Missing cart');
      console.error(err.stack);
      throw err;
    }
    if (isUpdating) {
      Router.push({
        pathname: deliveryRoute,
        query: {
          updating: 'true',
          orderId,
          limit,
          start,
        }
      });
    } else {
      if (consumer && consumer.data && consumer.data.StripeSubscriptionId) {
        Router.push(upcomingDeliveriesPath);
      } else {
        Router.push(planAheadRoute);
      }
    }
  }

  let title = isUpdating ? 'Update week' : 'Your week';
  const incrementDonationCount = useIncrementCartDonationCount();
  const decrementDonationCount = useDecrementCartDonationCount();

  const mealCount = cart ? Cart.getStandardMealCount(cart) : 0;
  let summary: summary[][] = [];
  let suggestions: string[] = [];
  if (plans.data) {
    let planId = Plan.getActivePlan(PlanNames.Standard, plans.data).stripePlanId;
    if (consumer && consumer.data && consumer.data.Plan) {
      const activeStandard = consumer.data.Plan.MealPlans.find(mp => mp.PlanName === PlanNames.Standard);
      if (activeStandard && activeStandard.StripePlanId !== planId) planId = activeStandard.StripePlanId;
    }
    const minPrice = Tier.getMealPrice(planId, MIN_MEALS, plans.data);
    suggestions = getSuggestion(cart, MIN_MEALS, minPrice);
    summary = plans.data.filter(p => {
      if (consumer && consumer.data && consumer.data.Plan) {
        return consumer.data.Plan.MealPlans.find(mp => p.StripePlanId === mp.StripePlanId);
      }
      return p.IsActive;
    }).map(p => p.Tiers.map(t => {
      const isActive = Boolean(mealCount >= t.MinMeals && (!t.MaxMeals || (t.MaxMeals && mealCount <= t.MaxMeals)));
      return {
        meals: `${t.minMeals}+ meals`,
        price: `$${(t.MealPrice / 100).toFixed(2)}/meal`,
        isActive,
      };
    }));
  }
  return (
    <>
      {render(
        cart,
        suggestions.length > 0 || mealCount === 0,
        onNext,
        suggestions,
        summary,
        donationCount,
        incrementDonationCount,
        decrementDonationCount,
        title,
        isUpdating && cart ? 'Next to delivery' : 'Next', 
      )}
    </>
  );
}

export default withClientApollo(MenuCart);