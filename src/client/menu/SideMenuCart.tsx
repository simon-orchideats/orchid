import { makeStyles, Typography, Button } from "@material-ui/core";
import withClientApollo from "../utils/withClientApollo";
import CartMealGroup from "../order/CartMealGroup";
import { useGetCart } from "../global/state/cartState";
import { OrderMeal } from "../../order/orderRestModel";
import { checkoutRoute } from "../../pages/checkout";
import Router from 'next/router'

const useStyles = makeStyles(theme => ({
  suggestion: {
    color: theme.palette.warning.dark,
    fontWeight: 600,
  },
  button: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

const SideMenuCart: React.FC = () => {
  const classes = useStyles();
  const cart = useGetCart();
  const disabled = false;
  const onNext = () => {
    Router.push(checkoutRoute)
  };
  const suggestions: string[] = [];
  const meals = (
    <>
      {
        cart && cart.rest &&
        <div>
          <Typography variant='h6'>
            {cart.rest.restName}
          </Typography>
          {cart.rest.meals.map(m => (
            <CartMealGroup key={OrderMeal.getKey(m)} m={m} />
          ))}
        </div>
      }
    </>
  );
  return (
    <>
      <Button
        disabled={disabled}
        variant='contained'
        color='primary'
        className={classes.button}
        fullWidth
        onClick={onNext}
      >
        Checkout
      </Button>
      {suggestions.map((suggestion, i) => (
        <Typography
          key={i}
          variant='body1'
          className={classes.suggestion}
        >
          {suggestion}
        </Typography>
      ))}
      {meals}
    </>
  )
}

export default withClientApollo(SideMenuCart);