import { makeStyles, Typography, Divider, Button } from "@material-ui/core";
import { useGetCart } from "../global/state/cartState";
import { useGetRest } from "../../rest/restService";
import withClientApollo from "../utils/withClientApollo";
import CartMealGroup from "../order/CartMealGroup";
import { getNextDeliveryDate } from "../../order/utils";
import { Consumer, ConsumerPlan } from "../../consumer/consumerModel";
import { useGetAvailablePlans } from "../../plan/planService";
import { Plan } from "../../plan/planModel";
import { Cart, CartMeal } from "../../order/cartModel";

const useStyles = makeStyles(theme => ({
  title: {
    paddingBottom: theme.spacing(1),
  },
  paddingBottom: {
    paddingBottom: theme.spacing(2),
  },
  summary: {
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  hint: {
    color: theme.palette.text.hint,
  },
  button: {
    marginBottom: theme.spacing(2),
  }
}));

type props = {
  onPlaceOrder: () => void
  buttonBottom?: boolean
}

const CheckoutCart: React.FC<props> = ({
  onPlaceOrder,
  buttonBottom = false,
}) => {
  const classes = useStyles();
  const cart = useGetCart();
  const plans = useGetAvailablePlans();
  if (!cart || !plans.data) return null;
  if (!cart.DeliveryTime) {
    const err = new Error('Missing delivery time');
    console.error(err.stack);
    throw err;
  }
  const rest = useGetRest(cart ? cart.RestId : null);
  const groupedMeals = cart && cart.Meals;
  const price = `$${Plan.getPlanPrice(cart.StripePlanId, plans.data).toFixed(2)}`
  const deliveryDate = getNextDeliveryDate(cart.DeliveryDay);
  const button = (
    <Button
      variant='contained'
      color='primary'
      onClick={onPlaceOrder}
      className={classes.button}
    >
      Place order
    </Button>
  )
  return (
    <>
      {!buttonBottom && button}
      <Typography
        variant='h6'
        color='primary'
        className={classes.title}
      >
        Order summary
      </Typography>
      <Typography
        variant='h6'
        className={classes.paddingBottom}
      >
        {rest.data ? rest.data.Profile.Name : ''}
      </Typography>
      {groupedMeals && groupedMeals.map(mealGroup => (
        <CartMealGroup key={mealGroup.MealId} mealGroup={mealGroup} />
      ))}
      {
        cart && cart.DonationCount > 0 &&
        <CartMealGroup
          mealGroup={new CartMeal({
            mealId: 'donations',
            img: '/heartHand.png',
            name: 'Donation',
            quantity: cart.DonationCount
          })}
        />
      }
      <Typography variant='body1'>
        Deliver on {deliveryDate.format('M/D/YY')}, {ConsumerPlan.getDeliveryTimeStr(cart.DeliveryTime)}
      </Typography>
      <Typography variant='body1'>
        Deliver again on {Consumer.getWeekday(cart.DeliveryDay)}
      </Typography>
      <Divider className={classes.divider} />
      <div className={classes.summary}>
        <div className={classes.row}>
          <Typography variant='body1'>
            {Cart.getMealCount(cart.Meals)} meal plan
          </Typography>
          <Typography variant='body1'>
            {price}
          </Typography>
        </div>
        <div className={classes.row}>
          <Typography variant='body1' color='primary'>
            Shipping
          </Typography>
          <Typography variant='body1' color='primary'>
            <b>FREE</b>
          </Typography>
        </div>
        <div className={`${classes.row} ${classes.paddingBottom}`} >
          <Typography variant='body1' color='primary'>
            Total
          </Typography>
          <Typography variant='body1' color='primary'>
            {price}
          </Typography>
        </div>
        {buttonBottom && button}
        <Typography variant='body2' className={classes.hint}>
          You will be charged {price} on {deliveryDate.subtract(2, 'd').format('M/D/YY')}. Your plan will automatically
          renew every week unless you update or cancel your account before the cutoff
          (12:00 am EST, 2 days before delivery of next meal).
        </Typography>
      </div>
    </>
  )
}

export default withClientApollo<props>(CheckoutCart);