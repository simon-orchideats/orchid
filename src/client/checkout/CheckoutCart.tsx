import { makeStyles, Typography, Divider, Button } from "@material-ui/core";
import { useGetCart } from "../global/state/cartState";
import withClientApollo from "../utils/withClientApollo";
import CartMealGroup from "../order/CartMealGroup";
import { useGetAvailablePlans } from "../../plan/planService";
import { Tier, PlanNames } from "../../plan/planModel";
import moment from "moment";
import { Schedule } from "../../consumer/consumerModel";
import { Cost } from "../../order/costModel";
import { Cart } from "../../order/cartModel";
import { MealPrice } from "../../order/orderModel";
import CircularProgress from '@material-ui/core/CircularProgress';
import BaseInput from "../general/inputs/BaseInput";
import { RefObject } from "react";

const useStyles = makeStyles(theme => ({
  title: {
    paddingBottom: theme.spacing(1),
  },
  paddingBottom: {
    paddingBottom: theme.spacing(2),
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
    // so that the button doesn't shrink on safari. determined by inspection
    minHeight: 36,
  },
}));

type props = {
  amountOff: number
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
}) => {
  const classes = useStyles();
  const cart = useGetCart();
  const plans = useGetAvailablePlans();
  if (!cart || !plans.data) return null;
  const mealCount = Cart.getStandardMealCount(cart);
  const mealPrices = MealPrice.getMealPriceFromDeliveries(plans.data, cart.Deliveries, cart.DonationCount);
  const planPrice = Tier.getPlanPrice(PlanNames.Standard, mealCount, plans.data);
  const orderButton = (
    <Button
      variant='contained'
      color='primary'
      fullWidth
      disabled={loading}
      onClick={onPlaceOrder}
      className={classes.button}
    >
      {loading ? <CircularProgress size={25} /> : 'Place order'}
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
  const total = ((taxes + planPrice - amountOff + (deliveryFee * (cart.Schedules.length - 1))) / 100).toFixed(2);
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
            {Object.values(restMealsPerDelivery[i]).map((restMeal, j) => (
              <div key={i + ',' + j + '-' + restMeal.meals[0].RestId}>
                <Typography variant='subtitle1' className={classes.paddingBottom}>
                  {restMeal.meals[0].RestName}
                </Typography>
                {
                  restMeal.meals.map(m => 
                    <CartMealGroup
                      key={m.MealId}
                      choices={m.Choices}
                      mealId={m.MealId}
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
      <Divider className={classes.divider} />
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
          <Typography variant='body1'>
            Promo
          </Typography>
          <Typography variant='body1' color='primary'>
            <b>-${(amountOff / 100).toFixed(2)}</b>
          </Typography>
        </div>
        <div className={`${classes.row} ${classes.paddingBottom}`} >
          <Typography variant='body1' color='primary'>
            Total
          </Typography>
          <Typography variant='body1' color='primary'>
            ${total}
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