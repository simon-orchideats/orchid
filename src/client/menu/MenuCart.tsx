import { useGetCart, useIncrementCartDonationCount, useDecrementCartDonationCount, useClearCartMeals } from "../global/state/cartState";
import { useGetAvailablePlans } from "../../plan/planService";
import withClientApollo from "../utils/withClientApollo";
import { Cart } from "../../order/cartModel";
import Router, { useRouter } from 'next/router'
import { upcomingDeliveriesRoute } from "../../pages/consumer/upcoming-deliveries";
import { deliveryRoute } from "../../pages/delivery";
import { useGetConsumer } from "../../consumer/consumerService";
import { Tier, MIN_MEALS, PlanNames } from "../../plan/planModel";
import { Schedule } from "../../consumer/consumerModel";
import { useUpdateOrder } from "../order/orderService";
import { useMutationResponseHandler } from "../../utils/apolloUtils";
import { Order } from "../../order/orderModel";

export const getSuggestion = (cart: Cart | null, minMeals: number) => {
  if (!cart) return [];
  let suggestion: string[] = [];
  Object.values(cart.RestMeals).forEach(restMeals => {
    const numMealsFromRest = Cart.getRestMealCount(restMeals.mealPlans);
    if (numMealsFromRest < minMeals) {
      suggestion.push(`${numMealsFromRest}/${minMeals} meals for ${restMeals.meals[0].RestName}`);
    }
  });
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
  const clearCartMeals = useClearCartMeals();
  const [updateOrder, updateOrderRes] = useUpdateOrder();
  const urlQuery = useRouter().query;
  const updatingParam = urlQuery.updating;
  const isUpdating = !!updatingParam && updatingParam === 'true'
  const deliveryIndex = parseFloat(urlQuery.deliveryIndex as string);
  const orderId = urlQuery.orderId as string
  const upcomingDeliveriesPath = {
    pathname: upcomingDeliveriesRoute,
    query: { updating: 'true' }
  }
  useMutationResponseHandler(updateOrderRes, () => {
    clearCartMeals();
    Router.push(upcomingDeliveriesPath);
  });
  const onUpdateOrder = () => {
    if (!cart) {
      const err = new Error('Missing cart');
      console.error(err.stack);
      throw err;
    }
    // todo simon: metrics here
    updateOrder(orderId, Order.getUpdatedOrderInput(deliveryIndex, cart));
  }
  const onNext = () => {
    if (!plans.data) {
      const err = new Error('Missing plans');
      console.error(err.stack);
      throw err;
    }
    if (!cart) {
      const err = new Error('Missing cart');
      console.error(err.stack);
      throw err;
    }
    if (isUpdating) {
      onUpdateOrder();
    } else {
      if (consumer && consumer.data && consumer.data.StripeSubscriptionId) {
        Router.push(upcomingDeliveriesPath);
      } else {
        Router.push(deliveryRoute);
      }
    }
  }

  let title = 'Your week';
  if (isUpdating && cart) {
    const d = cart.Deliveries[deliveryIndex];
    if (d) {
      const str = Schedule.getDateTimeStr(d.DeliveryDate, d.DeliveryTime)
      title = `Update delivery for ${str}`
    }
  }

  // left off here. handle all donations
  const incrementDonationCount = useIncrementCartDonationCount();
  const decrementDonationCount = useDecrementCartDonationCount();

  const mealCount = cart ? cart.getStandardMealCount() : 0;
  let summary = '';
  let suggestions: string[] = [];
  if (plans.data) {
    if (mealCount >= MIN_MEALS) {
      const moreToNext = Tier.getCountTillNextPlan(PlanNames.Standard, mealCount, plans.data);
      const nextPrice = Tier.getNextMealPrice(PlanNames.Standard, mealCount, plans.data);
      const next = moreToNext && nextPrice ? ` +${moreToNext} for ${(nextPrice / 100).toFixed(2)} ea` : ''
      summary = `${mealCount} meals plan (${(Tier.getMealPrice(PlanNames.Standard, mealCount, plans.data) / 100).toFixed(2)} ea).${next}`
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
        isUpdating && cart ? 'Update delivery' : 'Next', 
      )}
    </>
  );
}

export default withClientApollo(MenuCart);