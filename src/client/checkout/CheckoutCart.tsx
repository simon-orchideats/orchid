import { makeStyles, Typography, Divider, Button } from "@material-ui/core";
import { useGetCart } from "../global/state/cartState";
import { useGetRest } from "../../rest/restService";
import withClientApollo from "../utils/withClientApollo";
import CartMealGroup from "../order/CartMealGroup";
import { getNextDeliveryDate } from "../../order/utils";
import { Consumer } from "../../consumer/consumerModel";
import { useGetAvailablePlans } from "../../plan/planService";
import { Plan } from "../../plan/planModel";
import { Cart } from "../../order/cartModel";

const useStyles = makeStyles(theme => ({
  title: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(1),
  },
  restName: {
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
    paddingTop: theme.spacing(1),
  },
}));

type props = {
  onPlaceOrder: () => void
}

const CheckoutCart: React.FC<props> = ({
  onPlaceOrder,
}) => {
  const classes = useStyles();
  const cart = useGetCart();
  const plans = useGetAvailablePlans();
  if (!cart || !plans.data) return null;
  const rest = useGetRest(cart ? cart.RestId : null);
  const groupedMeals = cart && cart.Meals;
  const price = `$${Plan.getPlanPrice(cart.StripePlanId, plans.data).toFixed(2)}`
  return (
    <>
      <Button
        variant='contained'
        color='primary'
        onClick={onPlaceOrder}
      >
        Place order
      </Button>
      <Typography
        variant='h6'
        color='primary'
        className={classes.title}
      >
        Order summary
      </Typography>
      <Typography
        variant='h6'
        className={classes.restName}
      >
        {rest.data ? rest.data.Profile.Name : ''}
      </Typography>
      {groupedMeals && groupedMeals.map(mealGroup => (
        <CartMealGroup key={mealGroup.MealId} mealGroup={mealGroup} />
      ))}
      <Typography variant='body1'>
        Deliver on {getNextDeliveryDate(cart.DeliveryDay).format('M/D/YY')}, 6pm - 9pm
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
        <div className={classes.row}>
          <Typography variant='body1' color='primary'>
            Today's total
          </Typography>
          <Typography variant='body1' color='primary'>
            {price}
          </Typography>
        </div>
        <Typography variant='body2' className={classes.hint}>
          Your plan will automatically renew every week at {price} unless you update or cancel your account
          before the cutoff (11:59 pm EST, 2 days before delivery of next meal).
        </Typography>
      </div>
    </>
  )
}

export default withClientApollo<props>(CheckoutCart);