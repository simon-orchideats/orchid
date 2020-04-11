import { makeStyles, Typography, Divider, Button } from "@material-ui/core";
import { useGetCart } from "../global/state/cartState";
import withClientApollo from "../utils/withClientApollo";
import CartMealGroup from "../order/CartMealGroup";
import { useGetAvailablePlans } from "../../plan/planService";
import { Plan } from "../../plan/planModel";
import moment from "moment";
import { ConsumerPlan } from "../../consumer/consumerModel";
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
  },
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
  const mealCount = cart.getMealCount();
  const mealPrice = Plan.getMealPrice(mealCount, plans.data);
  const planPrice = Plan.getPlanPrice(mealCount, plans.data)
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
      {
        cart.DonationCount > 0 &&
        <CartMealGroup
          mealId='donations'
          img='/heartHand.png'
          name='Donation'
          quantity={cart.DonationCount}
        />
      }
      {
        cart.Deliveries.map(d => (
          <>
            <Typography variant='h6' className={classes.paddingBottom}>
              {moment(d.DeliveryDate).format('ddd M/D')}, {ConsumerPlan.getDeliveryTimeStr(d.DeliveryTime)}
            </Typography>
            {d.Meals.map((meal, i) => (
              <>
                {
                  (i == 0 || d.Meals[i].RestId !== meal.RestId) &&  
                  <Typography variant='subtitle1' className={classes.paddingBottom}>
                    {meal.RestName}
                  </Typography>
                }
                <CartMealGroup
                  mealId={meal.MealId}
                  name={meal.Name}
                  img={meal.Img}
                  quantity={meal.Quantity}
                />
              </>
            ))}
          </>
        )) 
      }
      <Divider className={classes.divider} />
      <div className={classes.summary}>
        <div className={classes.row}>
          <Typography variant='body1'>
            {mealCount} meal plan
          </Typography>
          <Typography variant='body1'>
            ${(mealPrice / 100).toFixed(2)} ea
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
            ${(planPrice / 100).toFixed(2)}
          </Typography>
        </div>
        {buttonBottom && button}
        <Typography variant='body2' className={classes.hint}>
          Your first payment will occur on {moment().add(1, 'w').format('M/D')} and will automatically renew every week
          unless canceled. Your price per meal is determined by the actual number of meals received per week, not
          by your subscription. This way you can make adjustments each week as necessary and be fairly charged.
        </Typography>
      </div>
    </>
  )
}

export default withClientApollo<props>(CheckoutCart);