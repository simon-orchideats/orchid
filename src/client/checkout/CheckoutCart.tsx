import { makeStyles, Typography, Button } from "@material-ui/core";
import { useGetCart, useGetCartSuggestions } from "../global/state/cartState";
import withClientApollo from "../utils/withClientApollo";
import CartMealGroup from "../order/CartMealGroup";
import CircularProgress from '@material-ui/core/CircularProgress';
import { OrderMeal } from "../../order/orderRestModel";
import { AVERAGE_MARKUP_PERCENTAGE } from "../../order/cartModel";

const useStyles = makeStyles(theme => ({
  title: {
    marginTop: theme.spacing(2),
    paddingBottom: theme.spacing(1),
  },
  paddingBottom: {
    paddingBottom: theme.spacing(2),
  },
  smallPaddingBottom: {
    paddingBottom: theme.spacing(1),
  },
  suggestion: {
    color: theme.palette.warning.dark,
    fontWeight: 600,
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  button: {
    marginBottom: theme.spacing(1),
    // so that the button doesn't shrink on safari. determined by inspection
    minHeight: 36,
  },
}));

type props = {
  hideCheckout?: boolean
  hideDeliveries?: boolean
  loading: boolean,
  tip: number,
  onPlaceOrder: () => void
}

const CheckoutCart: React.FC<props> = ({
  onPlaceOrder,
  hideCheckout = false,
  hideDeliveries = false,
  loading,
  tip,
}) => {
  const classes = useStyles();
  const cart = useGetCart();
  const suggestions = [] = useGetCartSuggestions();
  if (!cart || !cart.rest) return null;
  const orderButton = (
    <Button
      variant='contained'
      color='primary'
      fullWidth
      disabled={loading || suggestions.length > 0}
      onClick={onPlaceOrder}
      className={classes.button}
    >
      {loading ? <CircularProgress size={25} color='inherit' /> : 'Place order'}
    </Button>
  );
  const disclaimer = (
    <Typography variant='subtitle2' className={classes.smallPaddingBottom}>
      Thank you for choosing Table. Contact at simon@tableweekly.com or (609) 513-8166 for any issues
    </Typography>
  );

  let mealTotal = OrderMeal.getTotalMealCost(cart.rest.meals);
  const discount = cart.rest.discount;
  let discountAmount = 0;
  if (discount) {
    if (discount.percentOff) {
      discountAmount = mealTotal * (discount.percentOff / 100);
      mealTotal = mealTotal - discountAmount ;
    }
    if (discount.amountOff) {
      discountAmount = discount.amountOff;
      mealTotal = mealTotal - discount.amountOff
    }
  }
  const originalPrice = mealTotal / (1 - AVERAGE_MARKUP_PERCENTAGE / 100);
  const savings = ((originalPrice - mealTotal) / 100).toFixed(2);
  const taxes = mealTotal * cart.rest.taxRate;
  const total = mealTotal + taxes + cart.rest.deliveryFee + tip;
  return (
    <>
      {suggestions.map((suggestion, i) => (
        <Typography
          key={i}
          variant='body1'
          className={classes.suggestion}
        >
          {suggestion}
        </Typography>
      ))}
      {/* necessary div so that the rows dont reduce in height in safari */}
      <div>
        <div className={classes.row}>
          <Typography variant='body1'>
            Meal total
          </Typography>
          <Typography variant='body1'>
            ${(mealTotal / 100).toFixed(2)}
          </Typography>
        </div>
        {
          discount &&
          <div className={classes.row}>
            <Typography variant='body1'>
              <b>Sale</b>
            </Typography>
            <Typography variant='body1'>
              <b>-${(discountAmount / 100).toFixed(2)}</b>
            </Typography>
          </div>
        }
        <div className={classes.row}>
          <Typography variant='body1'>
            Tips
          </Typography>
          <Typography variant='body1'>
            ${(tip / 100).toFixed(2)}
          </Typography>
        </div>
        <div className={classes.row}>
          <Typography variant='body1'>
            Taxes
          </Typography>
          <Typography variant='body1'>
            ${(taxes / 100).toFixed(2)}
          </Typography>
        </div>
        <div className={classes.row}>
          <Typography variant='body1'>
            {cart.rest.deliveryFee === 0 ? <b>Delivery</b> : 'Delivery'}
          </Typography>
          <Typography variant='body1'>
            {cart.rest.deliveryFee === 0 ? <b>FREE</b> : `$${(cart.rest.deliveryFee / 100).toFixed(2)}`}
          </Typography>
        </div>
        <div className={`${classes.row}`} >
          <Typography variant='body1' color='primary'>
            <b>Total</b>
          </Typography>
          <Typography variant='body1' color='primary'>
            <b>${(total / 100).toFixed(2)}</b>
          </Typography>
        </div>
        <p />
        <div className={classes.row}>
          <Typography variant='body1'>
            <b>NO SERVICE FEE</b>
          </Typography>
        </div>
        <div className={classes.row}>
          <Typography variant='body1'>
            Saving <b>${savings}</b> vs other apps!
          </Typography>
        </div>
        <p />
        {!hideCheckout && orderButton}
        {!hideCheckout && disclaimer}
      </div>
      {
        !hideDeliveries &&
        <>
          <Typography
            variant='h6'
            color='primary'
            className={classes.title}
          >
            Order summary
          </Typography>
          <Typography variant='h6'>
            {cart.rest.restName}
          </Typography>
          {
            cart.rest.meals.map(m => (
              <CartMealGroup key={OrderMeal.getKey(m)} m={m} />
            ))
          }
        </>
      }
    </>
  )
}

export default withClientApollo<props>(CheckoutCart);