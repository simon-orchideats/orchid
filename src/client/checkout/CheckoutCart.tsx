import { makeStyles, Typography, Button } from "@material-ui/core";
import { useGetCart, useGetCartSuggestions } from "../global/state/cartState";
import withClientApollo from "../utils/withClientApollo";
import CartMealGroup from "../order/CartMealGroup";
import CircularProgress from '@material-ui/core/CircularProgress';
import { OrderMeal } from "../../order/orderRestModel";
import { Meal } from "../../rest/mealModel";
import { ServiceTypes } from "../../order/orderModel";

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
  green: {
    color: theme.palette.common.green,
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
  savings: {
    fontSize: '1.60rem',
    color: theme.palette.common.green,
  },
}));

type props = {
  hideCheckout?: boolean
  hideDeliveries?: boolean
  showPlan?: boolean
  loading: boolean,
  tip: number,
  onPlaceOrder: () => void
}

const CheckoutCart: React.FC<props> = ({
  onPlaceOrder,
  hideCheckout = false,
  hideDeliveries = false,
  showPlan = false,
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
    <>
      <Typography variant='subtitle2' className={classes.smallPaddingBottom}>
        Contact simon@tableweekly.com for any issues.
      </Typography>
      <Typography variant='subtitle2' className={classes.smallPaddingBottom}>
        By ordering, you acknowledge that you have read and agree to the Table Terms and Conditions and
        authorize us to charge your default payment method after your 30-day free trial. Your membership 
        continues until cancelled by visiting Your Plan.
      </Typography>
    </>
  );

  const mealTotal = OrderMeal.getTotalMealCost(cart.rest.meals, cart.rest.discount?.percentOff);
  const totalBadPrice = Meal.getTotalBadPrice(cart.rest.meals);
  const savings = (totalBadPrice - mealTotal) / 100;
  const taxes = Math.round(mealTotal * cart.rest.taxRate);
  const total = 
    mealTotal
    + taxes
    + (cart.serviceType === ServiceTypes.Delivery ? cart.rest.deliveryFee : 0)
    + tip;
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
          cart.serviceType === ServiceTypes.Delivery &&
          <div className={classes.row}>
            <Typography variant='body1'>
              Delivery
            </Typography>
            <Typography variant='body1'>
              {cart.rest.deliveryFee === 0 ? <b className={classes.green}>FREE</b> : `$${(cart.rest.deliveryFee / 100).toFixed(2)}`}
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
        <div className={`${classes.row}`} >
          <Typography variant='body1'>
            Service fee
          </Typography>
          <Typography variant='body1'  className={classes.green}>
            <b>FREE</b>
          </Typography>
        </div>
        <div className={`${classes.row} ${classes.smallPaddingBottom}`} >
          <Typography variant='body1' className={classes.green}>
            <b>Total</b>
          </Typography>
          <Typography variant='body1'  className={classes.green}>
            <b>${(total / 100).toFixed(2)}</b>
          </Typography>
        </div>
        {
          showPlan &&
          <Typography variant='body1' gutterBottom>
            Foodie Plan - FREE 30 day trial then $4.99/month (change/cancel anytime)
          </Typography>
          }
        <p />
        {
          savings > 0 &&
          <>
            <div className={classes.row}>
              <Typography variant='body1' className={classes.savings}>
                <b>Saving ${savings.toFixed(2)}</b>
              </Typography>
            </div>
            <p />
          </>
        }
        {!hideCheckout && orderButton}
        {!hideCheckout && disclaimer}
      </div>
      {
        !hideDeliveries &&
        <>
          <Typography
            variant='h6'
            className={classes.title}
          >
            Order summary
          </Typography>
          <Typography variant='h6'>
            {cart.rest.restName} {cart.rest.discount?.percentOff && <b className={classes.green}>({cart.rest.discount.percentOff}% sale)</b>}
          </Typography>
          {
            cart.rest.meals.map(m => (
              <CartMealGroup
                key={OrderMeal.getKey(m)}
                m={m}
                percentDiscount={cart.rest?.discount?.percentOff || undefined}
              />
            ))
          }
        </>
      }
    </>
  )
}

export default withClientApollo<props>(CheckoutCart);