import { useGetCart, useIncrementCartDonationCount, useDecrementCartDonationCount } from "../global/state/cartState";
import { useGetAvailablePlans } from "../../plan/planService";
import withClientApollo from "../utils/withClientApollo";
import { Cart } from "../../order/cartModel";
import Router, { useRouter } from 'next/router'
import { upcomingDeliveriesRoute } from "../../pages/consumer/upcoming-deliveries";
import { deliveryRoute } from "../../pages/delivery";
import { useGetConsumer } from "../../consumer/consumerService";
import { Tier, MIN_MEALS, PlanNames } from "../../plan/planModel";

export const getSuggestion = (cart: Cart | null, minMeals: number) => {
  if (!cart) return [];
  let suggestion: string[] = [];
  const mealCount = Cart.getStandardMealCount(cart)
  if (mealCount < minMeals) {
    suggestion.push(`Need ${minMeals - mealCount} more meals`);
  }
  return suggestion;
}

const MenuCart: React.FC<{
  render: (
    cart: Cart | null,
    disabled: boolean | undefined,
    onNext: () => void,
    suggestions: string[],
    summary: string,
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
        Router.push(deliveryRoute);
      }
    }
  }

  let title = isUpdating ? 'Update week' : 'Your week';
  const incrementDonationCount = useIncrementCartDonationCount();
  const decrementDonationCount = useDecrementCartDonationCount();

  const mealCount = cart ? Cart.getStandardMealCount(cart) : 0;
  let summary = '';
  let suggestions: string[] = [];
  if (plans.data) {
    if (mealCount >= MIN_MEALS) {
      const moreToNext = Tier.getCountTillNextPlan(PlanNames.Standard, mealCount, plans.data);
      const nextPrice = Tier.getNextMealPrice(PlanNames.Standard, mealCount, plans.data);
      const next = moreToNext && nextPrice ? ` +${moreToNext} for ${(nextPrice / 100).toFixed(2)} ea` : ''
      summary = `${mealCount} meal plan (${(Tier.getMealPrice(PlanNames.Standard, mealCount, plans.data) / 100).toFixed(2)} ea).${next}`
    }
    suggestions = getSuggestion(cart, MIN_MEALS);
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