import { makeStyles, Typography, Divider, Button } from "@material-ui/core";
import { useGetCart } from "../global/state/cartState";
import withClientApollo from "../utils/withClientApollo";
import CartMealGroup from "../order/CartMealGroup";
import { useGetAvailablePlans } from "../../plan/planService";
import { Plan } from "../../plan/planModel";
import { Cart } from "../../order/cartModel";

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
  const groupedMeals = cart && cart.Meals;
  const price = `$${Plan.getPlanPrice(Cart.getMealCount(cart), plans.data).toFixed(2)}`
  // todo simon: figure out how to dispaly multiple deliveries on here
  // const deliveryDate = getNextDeliveryDate(cart.DeliveryDay);
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
      {groupedMeals && groupedMeals.map(mealGroup => (
        <CartMealGroup
          key={mealGroup.MealId}
          mealId={mealGroup.MealId}
          img={mealGroup.Img}
          name={mealGroup.Name}
          quantity={mealGroup.Quantity}
        />
      ))}
      {
        cart && cart.DonationCount > 0 &&
        <CartMealGroup
          mealId='donations'
          img='/heartHand.png'
          name='Donation'
          quantity={cart.DonationCount}
        />
      }
      {/*   // todo simon: figure out how to dispaly multiple deliveries on here */}
      {/* <Typography variant='body1'>
        Deliver on {deliveryDate.format('M/D/YY')}, {ConsumerPlan.getDeliveryTimeStr(cart.DeliveryTime)}
      </Typography> */}
      {/* <Typography variant='body1'>
        Deliver again on {Consumer.getWeekday(cart.DeliveryDay)}
      </Typography> */}
      <Divider className={classes.divider} />
      <div className={classes.summary}>
        <div className={classes.row}>
          <Typography variant='body1'>
            {Cart.getMealCount(cart)} meal plan
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
        {/* todo simon: edit this */}
        {/* <Typography variant='body2' className={classes.hint}>
          You will be charged {price} on {deliveryDate.subtract(2, 'd').format('M/D/YY')}. Your plan will automatically
          renew every week unless you update or cancel your account before the cutoff
          (12:00 am EST, 2 days before delivery of next meal).
        </Typography> */}
      </div>
    </>
  )
}

export default withClientApollo<props>(CheckoutCart);