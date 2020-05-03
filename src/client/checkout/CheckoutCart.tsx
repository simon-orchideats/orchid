import { makeStyles, Typography, Divider, Button } from "@material-ui/core";
import { useGetCart } from "../global/state/cartState";
import withClientApollo from "../utils/withClientApollo";
import CartMealGroup from "../order/CartMealGroup";
import { useGetAvailablePlans } from "../../plan/planService";
import { Tier, PlanNames } from "../../plan/planModel";
import moment from "moment";
import { Schedule } from "../../consumer/consumerModel";
import { deliveryFee } from "../../order/costModel";
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
  const mealCount = Cart.getStandardMealCount(cart);
  const mealPrice = Tier.getMealPrice(PlanNames.Standard, mealCount, plans.data);
  const planPrice = Tier.getPlanPrice(PlanNames.Standard, mealCount, plans.data);
  const button = (
    <Button
      variant='contained'
      color='primary'
      onClick={onPlaceOrder}
      className={classes.button}
    >
      Place order
    </Button>
  );

  const taxes = cart.Deliveries.reduce<number>((taxes, d) => 
    taxes + d.Meals.reduce<number>((sum, m) => sum + (m.TaxRate * mealPrice * m.Quantity), 0)
  , 0);

  const total = ((taxes + planPrice + (deliveryFee * (cart.Schedules.length - 1))) / 100).toFixed(2);

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
        cart.Deliveries.map((d, i) => (
          <div key={i}>
            <Typography variant='h6' className={classes.paddingBottom}>
              {Schedule.getDateTimeStr(d.DeliveryDate, d.DeliveryTime)}
            </Typography>
            {d.Meals.map((meal, j) => (
              <div key={i + ',' + j + '-' + meal.RestId}>
                {
                  (j == 0 || d.Meals[j].RestId !== meal.RestId) &&  
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
              </div>
            ))}
          </div>
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
          <Typography variant='body1'>
            Taxes
          </Typography>
          <Typography variant='body1'>
            ${(taxes / 100).toFixed(2)}
          </Typography>
        </div>
        <div className={classes.row}>
          <Typography variant='body1'>
            Delivery
          </Typography>
          {
            cart.Deliveries.length === 1 ?
              <Typography variant='body1' color='primary'>
                <b>FREE</b>
              </Typography>
            :
              <Typography variant='body1'>
                +{cart.Deliveries.length - 1} (${(deliveryFee / 100).toFixed(2)} ea)
              </Typography>
          }
        </div>
        <div className={`${classes.row} ${classes.paddingBottom}`} >
          <Typography variant='body1' color='primary'>
            Total
          </Typography>
          <Typography variant='body1' color='primary'>
            ${total}
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