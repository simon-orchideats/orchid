import { makeStyles, Typography, Button } from "@material-ui/core";
import { useGetCart } from "../global/state/cartState";
import withClientApollo from "../utils/withClientApollo";
import CartMealGroup from "../order/CartMealGroup";
import { useGetAvailablePlans } from "../../plan/planService";
import { Tier, PlanNames, Plan } from "../../plan/planModel";
import moment from "moment";
import { Schedule } from "../../consumer/consumerPlanModel";
import { Cost, competitorMealPrice } from "../../order/costModel";
import { Cart } from "../../order/cartModel";
import { MealPrice } from "../../order/orderModel";
import CircularProgress from '@material-ui/core/CircularProgress';
import BaseInput from "../general/inputs/BaseInput";
import { RefObject } from "react";
import { promoDurations } from "../../order/promoModel";

const useStyles = makeStyles(theme => ({
  title: {
    marginTop: theme.spacing(2),
    paddingBottom: theme.spacing(1),
  },
  paddingBottom: {
    paddingBottom: theme.spacing(2),
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  hint: {
    color: theme.palette.text.hint,
  },
  button: {
    marginBottom: theme.spacing(2),
    // so that the button doesn't shrink on safari. determined by inspection
    minHeight: 36,
  },
}));

type props = {
  amountOff: number
  promoDuration?: promoDurations
  buttonBottom?: boolean
  defaultPromo?: string
  loading: boolean,
  onApplyPromo: () => void
  onChangePromo: () => void
  onPlaceOrder: () => void
  promoRef: RefObject<HTMLInputElement>
}

const CheckoutCart: React.FC<props> = ({
  amountOff,
  buttonBottom = false,
  defaultPromo,
  loading,
  onApplyPromo,
  onChangePromo,
  onPlaceOrder,
  promoRef,
  promoDuration,
}) => {
  const classes = useStyles();
  const cart = useGetCart();
  const plans = useGetAvailablePlans();
  if (!cart || !plans.data) return null;
  const mealCount = Cart.getStandardMealCount(cart);
  const mealPrices = MealPrice.getMealPriceFromDeliveries(plans.data, cart.Deliveries, cart.DonationCount);
  const standard = Plan.getActivePlan(PlanNames.Standard, plans.data);
  const planPrice = Tier.getPlanPrice(standard.stripePlanId, mealCount, plans.data);
  const orderButton = (
    <Button
      variant='contained'
      color='primary'
      fullWidth
      disabled={loading}
      onClick={onPlaceOrder}
      className={classes.button}
    >
      {loading ? <CircularProgress size={25} /> : 'Secure checkout'}
    </Button>
  );
  const applyPromoButton = (
    <Button
      variant='outlined'
      fullWidth
      onClick={onApplyPromo}
      className={classes.button}
    >
      Apply promo
    </Button>
  );
  const promoInput = (
    <BaseInput
      // using key to force BaseInput to rerender, otherwise updates to defaultValue don't get shown. we do this because
      // using a controlled component with setState on the promo code value is laggy when being updated
      // so we went the ref route and if we do ref route, we need defaultValue
      key={defaultPromo}
      className={classes.button}
      onChange={onChangePromo}
      label='Promo code'
      inputRef={promoRef}
      defaultValue={defaultPromo}
    />
  )
  const taxes = Cost.getTaxes(cart.Deliveries, mealPrices);
  const deliveryFee = Cost.getDeliveryFee(cart.Deliveries);
  const total = ((taxes + planPrice - amountOff + (deliveryFee * (cart.Schedules.length - 1))) / 100);
  const competitorPrice = competitorMealPrice * mealCount;
  const restMealsPerDelivery = Cart.getRestMealsPerDelivery(cart.deliveries);
  return (
    <>
      {
        !buttonBottom &&
        <>
          {orderButton}
          {promoInput}
          {applyPromoButton}
        </>
      }
      {/* necessary div so that the rows dont reduce in height in safari */}
      <div>
        <div className={classes.row}>
          <Typography variant='body1'>
            {mealCount} meal plan
          </Typography>
          {
            mealPrices.map(mp => (
              <Typography variant='body1' key={mp.stripePlanId}>
                ${(mp.mealPrice / 100).toFixed(2)} ea
              </Typography>
            ))
          }
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
        <div className={classes.row}>
          <Typography variant='body1' color='primary'>
            <b>Promo {promoDuration !== 'once' && 'for 4 weeks'}</b>
          </Typography>
          <Typography variant='body1' color='primary'>
            <b>-${(amountOff / 100).toFixed(2)}</b>
          </Typography>
        </div>
        <div className={`${classes.row}`} >
          <Typography variant='body1' color='primary'>
            <b>Weekly Total</b>
          </Typography>
          <Typography variant='body1' color='primary'>
            <b>${total.toFixed(2)}</b>
          </Typography>
        </div>
        <p />
        <div className={`${classes.row}`} >
          <Typography variant='body1'>
            Other delivery apps
          </Typography>
          <Typography variant='body1'>
            <del>${competitorPrice.toFixed(2)}</del>
          </Typography>
        </div>
        <div className={`${classes.row} ${classes.paddingBottom}`} >
          <Typography variant='body1' color='primary'>
            You save
          </Typography>
          <Typography variant='body1' color='primary'>
            ${(competitorPrice - total).toFixed(2)}
          </Typography>
        </div>
        {
          buttonBottom && 
          <>
            {promoInput}
            {applyPromoButton}
            {orderButton}
          </>
        }
        <Typography variant='subtitle2' className={classes.paddingBottom}>
          Your first payment is on <b>{moment().add(1, 'w').format('M/D')}</b>. Satisfaction is guaranteed. Contact us
          at simon@orchideats.com or call (609) 513-8166 with any concerns or refunds.
        </Typography>
        <Typography variant='body2' className={classes.hint}>
          Your subscription renews every week. Pricing is based on meals per week. Skip weeks or cancel anytime.
        </Typography>
      </div>
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
            {Object.values(restMealsPerDelivery[i]).map((restMeal, j) => (
              <div key={i + ',' + j + '-' + restMeal.meals[0].RestId}>
                <Typography variant='subtitle1' className={classes.paddingBottom}>
                  {restMeal.meals[0].RestName}
                </Typography>
                {
                  restMeal.meals.map(m => 
                    <CartMealGroup
                      key={m.IdKey}
                      choices={m.Choices}
                      name={m.Name}
                      img={m.Img}
                      quantity={m.Quantity}
                    />
                  )
                }
              </div>
            ))}
          </div>
        )) 
      }
    </>
  )
}

export default withClientApollo<props>(CheckoutCart);