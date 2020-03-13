//@ts-ignore
import { useGetCart } from "../global/state/cartState";
import { useGetRest } from "../../rest/restService";
import { useGetAvailablePlans } from "../../plan/planService";
import withClientApollo from "../utils/withClientApollo";
import { Plan } from "../../plan/planModel";
// import { deliveryRoute } from "../../pages/delivery";
import { Cart } from "../../order/cartModel";
import Router from 'next/router'
import { sendCartMenuMetrics } from "./menuMetrics";
import { upcomingDeliveriesRoute } from "../../pages/consumer/upcoming-deliveries";
import { ApolloError } from "apollo-client";
import { Rest } from "../../rest/restModel";

export const getSuggestion = (currCount: number, fixedMealCount: number | null) => {
  if (fixedMealCount) {
    if (currCount < fixedMealCount) return `Add ${fixedMealCount - currCount} more`;
    if (currCount === fixedMealCount) return '';
    if (currCount > fixedMealCount) return `Remove ${currCount - fixedMealCount}`;
  }
  return '';
}

const MenuCart: React.FC<{
  render: (
    cart: Cart | null,
    sortedPlans: {
      loading: boolean;
      error: ApolloError | undefined;
      data: Plan[] | undefined;
    },
    disabled: boolean | undefined,
    onNext: () => void,
    rest: {
      loading: boolean;
      error: ApolloError | undefined;
      data: Rest | undefined;
    },
    suggestion: string | undefined,
  ) => React.ReactNode
}> = ({
  render
}) => {
  const cart = useGetCart();
  const sortedPlans = useGetAvailablePlans();
  const rest = useGetRest(cart ? cart.RestId : null);
  const fixedMealCount = (cart && cart.StripePlanId) ? Plan.getPlanCount(cart.StripePlanId, sortedPlans.data || []) : null;
  const mealCount = cart ? Cart.getMealCount(cart.Meals) : 0;
  const stripePlanId = Plan.getPlanId(mealCount, sortedPlans.data);
  const onNext = () => {
    if (!stripePlanId) throw new Error('Missing stripePlanId')
    // Router.push(deliveryRoute);
    Router.push({
      pathname: upcomingDeliveriesRoute,
      query: { updating: 'true' }
    });
    sendCartMenuMetrics(
      stripePlanId,
      sortedPlans.data,
      cart,
      rest.data,
      mealCount,
    );
  }

  const disabled = cart === null || cart.Zip === null || (fixedMealCount !== null && mealCount !== fixedMealCount)

  const suggestion = getSuggestion(mealCount, fixedMealCount);
  return (
    <>
      {render(
        cart,
        sortedPlans,
        disabled,
        onNext,
        rest,
        suggestion,
      )}
    </>
  );
}

export default withClientApollo(MenuCart);