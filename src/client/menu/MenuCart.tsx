import { useGetCart, useIncrementCartDonationCount, useDecrementCartDonationCount } from "../global/state/cartState";
import { useGetRest } from "../../rest/restService";
import { useGetAvailablePlans } from "../../plan/planService";
import withClientApollo from "../utils/withClientApollo";
import { Plan } from "../../plan/planModel";
import { Cart } from "../../order/cartModel";
import Router, { useRouter } from 'next/router'
import { sendCartMenuMetrics } from "./menuMetrics";
import { upcomingDeliveriesRoute } from "../../pages/consumer/upcoming-deliveries";
import { ApolloError } from "apollo-client";
import { Rest } from "../../rest/restModel";
import { deliveryRoute } from "../../pages/delivery";
import { useGetConsumer } from "../../consumer/consumerService";

export const getSuggestion = (currCount: number, fixedMealCount: number | null) => {
  if (fixedMealCount) {
    const plural = Math.abs(currCount - fixedMealCount) > 1 ? 's' : '';
    if (currCount < fixedMealCount) return `Add ${fixedMealCount - currCount} meal${plural} or donation${plural}`;
    if (currCount === fixedMealCount) return '';
    if (currCount > fixedMealCount) return `Remove ${currCount - fixedMealCount} meal${plural} or donation${plural}`;
  }
  return '';
}

const MenuCart: React.FC<{
  render: (
    cart: Cart | null,
    disabled: boolean | undefined,
    onNext: () => void,
    rest: {
      loading: boolean;
      error: ApolloError | undefined;
      data: Rest | undefined;
    },
    suggestion: string | undefined,
    donationCount: number,
    incrementDonationCount: () => void,
    decremetnDonationCount: () => void,
    addDonationDisabled: boolean,
  ) => React.ReactNode
}> = ({
  render
}) => {
  const cart = useGetCart();
  const sortedPlans = useGetAvailablePlans();
  const consumer = useGetConsumer();
  const updatingParam = useRouter().query.updating;
  const isUpdating = !!updatingParam && updatingParam === 'true'
  const rest = useGetRest(cart ? cart.RestId : null);
  const fixedMealCount = (cart && cart.StripePlanId) ? Plan.getPlanCount(cart.StripePlanId, sortedPlans.data || []) : 0;
  const donationCount = cart ? cart.DonationCount : 0;
  console.log('donationCount', cart)
  const mealCount = cart ? Cart.getMealCount(cart.Meals) + donationCount : 0;
  const stripePlanId = Plan.getPlanId(mealCount, sortedPlans.data);
  const upcomingDeliveriesPath = {
    pathname: upcomingDeliveriesRoute,
    query: { updating: 'true' }
  }
  const onNext = () => {
    if (!stripePlanId) {
      const err = new Error('Missing stripePlanId');
      console.error(err.stack);
      throw err;
    }
    if (!sortedPlans.data) {
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
      Router.push(upcomingDeliveriesPath);
    } else {
      if (consumer && consumer.data && consumer.data.StripeSubscriptionId) {
        Router.push(upcomingDeliveriesPath);
      } else {
        Router.push(deliveryRoute);
      }
    }
    sendCartMenuMetrics(
      cart,
      rest.data ? rest.data.Profile.Name : null,
      Plan.getMealPrice(stripePlanId, sortedPlans.data),
    );
  }
  const incrementDonationCount = useIncrementCartDonationCount();
  const decrementDonationCount = useDecrementCartDonationCount();

  const disabled = cart === null || cart.Zip === null || (fixedMealCount > 0 && mealCount !== fixedMealCount)
  const suggestion = getSuggestion(mealCount, fixedMealCount);
  return (
    <>
      {render(
        cart,
        disabled,
        onNext,
        rest,
        suggestion,
        donationCount,
        incrementDonationCount,
        decrementDonationCount,
        donationCount === fixedMealCount,
      )}
    </>
  );
}

export default withClientApollo(MenuCart);