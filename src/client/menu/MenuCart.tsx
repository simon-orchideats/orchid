import { useGetCart, useIncrementCartDonationCount, useDecrementCartDonationCount } from "../global/state/cartState";
import { useGetAvailablePlans } from "../../plan/planService";
import withClientApollo from "../utils/withClientApollo";
import { Cart } from "../../order/cartModel";
import Router, { useRouter } from 'next/router'
// import { sendCartMenuMetrics } from "./menuMetrics";
import { upcomingDeliveriesRoute } from "../../pages/consumer/upcoming-deliveries";
import { deliveryRoute } from "../../pages/delivery";
import { useGetConsumer } from "../../consumer/consumerService";


//@ts-ignore // todosimon; redo this
export const getSuggestion = (currCount: number) => {
  return 'sup';
  // if (fixedMealCount) {
  //   const plural = Math.abs(currCount - fixedMealCount) > 1 ? 's' : '';
  //   if (currCount < fixedMealCount) return `Add ${fixedMealCount - currCount} meal${plural} or donation${plural}`;
  //   if (currCount === fixedMealCount) return '';
  //   if (currCount > fixedMealCount) return `Remove ${currCount - fixedMealCount} meal${plural} or donation${plural}`;
  // }
  // return '';
}

const MenuCart: React.FC<{
  render: (
    cart: Cart | null,
    disabled: boolean | undefined,
    onNext: () => void,
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
  const donationCount = cart ? cart.DonationCount : 0;
  const mealCount = cart ? Cart.getMealCount(cart) : 0;
  const upcomingDeliveriesPath = {
    pathname: upcomingDeliveriesRoute,
    query: { updating: 'true' }
  }
  const onNext = () => {
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
    // todo simon enable metrics
    // sendCartMenuMetrics(
    //   cart,
    //   cart && cart.RestName ? cart.RestName : null,
    //   Plan.getMealPrice(stripePlanId, sortedPlans.data),
    //   Plan.getPlanCount(stripePlanId, sortedPlans.data),
    // );
  }
  const incrementDonationCount = useIncrementCartDonationCount();
  const decrementDonationCount = useDecrementCartDonationCount();

  const disabled = false;
  const suggestion = getSuggestion(mealCount);
  return (
    <>
      {render(
        cart,
        disabled,
        onNext,
        suggestion,
        donationCount,
        incrementDonationCount,
        decrementDonationCount,
        false, // todo simon: update logic for this.
      )}
    </>
  );
}

export default withClientApollo(MenuCart);