import { makeStyles, Typography, Button } from "@material-ui/core";
import { useGetCart, useUpdateCartPlanId } from "../global/state/cartState";
import { useGetRest } from "../../rest/restService";
import { useGetAvailablePlans } from "../../plan/planService";
import withClientApollo from "../utils/withClientApollo";
import { getSuggestion } from "./utils";
import { Plan } from "../../plan/planModel";
import { deliveryRoute } from "../../pages/delivery";
import CartMealGroup from "../order/CartMealGroup";
import { Cart } from "../../order/cartModel";
import Router from 'next/router'
import { sendCartMenuMetrics } from "./menuMetrics";
// import { upcomingDeliveriesRoute } from "../../pages/consumer/upcoming-deliveries";

const useStyles = makeStyles(theme => ({
  group: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: theme.spacing(2),
  },
  img: {
    width: 55,
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
  title: {
    paddingBottom: theme.spacing(1)
  },
  suggestion: {
    color: theme.palette.warning.main,
  },
  button: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  bottom: {
    marginTop: 'auto',
  },
}));

const MenuCart: React.FC<{ hideNext?: boolean }> = ({ hideNext = false }) => {
  const classes = useStyles();
  const cart = useGetCart();
  const sortedPlans = useGetAvailablePlans();
  const planCounts = Plan.getPlanCounts(sortedPlans.data);
  const rest = useGetRest(cart ? cart.RestId : null);
  const mealCount = cart ? Cart.getMealCount(cart.Meals) : 0;
  const stripePlanId = Plan.getPlanId(mealCount, sortedPlans.data);
  const setCartStripePlanId = useUpdateCartPlanId();
  const onNext = () => {
    if (!stripePlanId) throw new Error('Missing stripePlanId')
    // if (true) {
      // Router.push({
      //   pathname: upcomingDeliveriesRoute,
      //   query: { updating: 'true' }
      // });
    // } else {
      Router.push(deliveryRoute);
    // }
    setCartStripePlanId(stripePlanId);
    sendCartMenuMetrics(
      stripePlanId,
      sortedPlans.data,
      cart,
      rest.data,
      mealCount,
    );
  }
  const disabled = hideNext || !cart || !cart.Zip || mealCount === 0 || (planCounts && !planCounts.includes(mealCount))
  const groupedMeals = cart && cart.Meals;
  return (
    <>
      <Typography
        variant='h4'
        color='primary'
        className={classes.title}
      >
        {rest.data ? `Meals from ${rest.data.Profile.Name}` : 'Your meals'}
      </Typography>
      {groupedMeals && groupedMeals.map(mealGroup => (
        <CartMealGroup key={mealGroup.MealId} mealGroup={mealGroup} />
      ))}
      <div className={classes.bottom}>
        {
          !hideNext &&
          <>
            <Typography variant='body1' className={classes.suggestion}>
              {getSuggestion(mealCount, sortedPlans.data)}
            </Typography>
            <Typography variant='body1' className={classes.suggestion}>
              {cart && cart.Zip ? null : 'Enter zip to continue'}
            </Typography>
            <Button
              disabled={disabled}
              variant='contained'
              color='primary'
              className={classes.button}
              fullWidth
              onClick={onNext}
            >
              {disabled ? 'Next' : `Next w/ ${mealCount} meals`}
            </Button>
          </>
        }
      </div>
    </>
  )
}

export default withClientApollo(MenuCart);