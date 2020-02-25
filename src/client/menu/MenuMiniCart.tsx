import { makeStyles, Typography, Button } from "@material-ui/core";
import { useGetCart, useUpdateCartPlanId } from "../global/state/cartState";
import { useGetAvailablePlans } from "../../plan/planService";
import withClientApollo from "../utils/withClientApollo";
import { getSuggestion } from "./utils";
import { Plan } from "../../plan/planModel";
import { deliveryRoute } from "../../pages/delivery";
import { Cart } from "../../order/cartModel";
import Router from 'next/router'
import { useGetRest } from "../../rest/restService";
import { sendCartMenuMetrics } from './menuMetrics';

const useStyles = makeStyles(theme => ({
  suggestion: {
    color: theme.palette.warning.main,
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
  button: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  container: {
    display: 'flex',
    alignItems: 'center',
  },
}));

const MenuMiniCart: React.FC<{ hideNext?: boolean }> = ({ hideNext = false }) => {
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
    Router.push(deliveryRoute);
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
  return (
    <div className={classes.container}>
      {
        !hideNext &&
        <>
          <Typography variant='body1' className={classes.suggestion}>
            {cart && cart.Zip ? getSuggestion(mealCount, sortedPlans.data) : 'Enter zip to continue'}
          </Typography>
          <Button
            disabled={disabled}
            variant='contained'
            color='primary'
            className={classes.button}
            onClick={onNext}
          >
            {disabled ? 'Next' : `Next w/ ${mealCount} meals`}
          </Button>
        </>
      }
    </div>
  )
}

export default withClientApollo(MenuMiniCart);