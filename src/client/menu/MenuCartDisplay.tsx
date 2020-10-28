import { makeStyles, Typography, Button } from "@material-ui/core";
import withClientApollo from "../utils/withClientApollo";
import CartMealGroup from "../order/CartMealGroup";
import { useGetCart, useGetCartSuggestions } from "../global/state/cartState";
import { OrderMeal } from "../../order/orderRestModel";
import { checkoutRoute } from "../../pages/checkout";
import Router from 'next/router'
import { Meal } from "../../rest/mealModel";

const useStyles = makeStyles(theme => ({
  suggestion: {
    color: theme.palette.warning.dark,
    fontWeight: 600,
  },
  button: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  verticalPadding: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  savings: {
    color: theme.palette.common.green,
  }
}));

const MenuCartDisplay: React.FC = () => {
  const classes = useStyles();
  const cart = useGetCart();
  const suggestions = useGetCartSuggestions();
  const onNext = () => {
    Router.push(checkoutRoute)
  };
  if (!cart || !cart.rest) {
    return (
      <Typography variant='h6'>
        Cart's empty. Add some meals to get started
      </Typography>
    )
  }
  const totalBadPrice = Meal.getTotalBadPrice(cart.rest.meals);
  const mealTotal = OrderMeal.getTotalMealCost(cart.rest.meals, cart.rest.discount?.percentOff);
  const savings = (totalBadPrice - mealTotal) / 100
  return (
    <>
      <Button
        disabled={suggestions.length > 0}
        variant='contained'
        color='primary'
        className={classes.button}
        fullWidth
        onClick={onNext}
      >
        Checkout
      </Button>
      {
        savings > 0 &&
        <Typography variant='h6' className={classes.verticalPadding}>
          <b className={classes.savings}>Saving ${savings.toFixed(2)}</b>
        </Typography>
      }
      {suggestions.map((suggestion, i) => (
        <Typography
          key={i}
          variant='body1'
          className={classes.suggestion}
        >
          {suggestion}
        </Typography>
      ))}
      <Typography variant='h6'>
        {cart.rest.restName} {cart.rest.discount?.percentOff && <b className={classes.savings}>({cart.rest.discount.percentOff}% sale)</b>}
      </Typography>
      {cart.rest.meals.map(m => (
        <CartMealGroup
          key={OrderMeal.getKey(m)}
          m={m}
          percentDiscount={cart.rest?.discount?.percentOff || undefined}
        />)
      )}
    </>
  )
}

export default withClientApollo(MenuCartDisplay);