import { makeStyles, Typography, Button, Grid, useMediaQuery, useTheme } from "@material-ui/core";
import withClientApollo from "../utils/withClientApollo";
import CartMealGroup from "../order/CartMealGroup";
import MenuCart from "./MenuCart";
import { useAddMealToCart, useRemoveMealFromCart } from "../global/state/cartState";
import { Cart } from "../../order/cartModel";
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';

const useStyles = makeStyles(theme => ({
  title: {
    paddingBottom: theme.spacing(1)
  },
  suggestion: {
    color: theme.palette.warning.dark,
    fontWeight: 600,
  },
  summary: {
    whiteSpace: 'pre-line',
    fontWeight: 600,
  },
  button: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  heart: {
    height: 24,
  },
  popper: {
    width: 300,
    padding: theme.spacing(2),
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  count: {
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    borderRadius: 20,
    display: 'flex',
    alignItems: 'center',
  },
}));

const SideMenuCart: React.FC<{ hideNext?: boolean }> = ({ hideNext = false }) => {
  const classes = useStyles();
  const addMealToCart = useAddMealToCart();
  const removeMealFromCart = useRemoveMealFromCart();
  return (
    <MenuCart
      render={(
      cart,
      disabled,
      onNext,
      suggestions,
      summary,
      donationCount,
      _incrementDonationCount,
      _decrementDonationCount,
      title,
      confirmText,
    ) => {
      const theme = useTheme();
      const isMd = useMediaQuery(theme.breakpoints.down('md'));
      const meals = (
        <>
          {cart && Object.entries(cart.RestMeals)
            .map(([restId, restMeals]) => (
              <div key={restId}>
                <Typography variant='h6'>
                  {restMeals.meals[0].restName}
                </Typography>
                {restMeals.meals.map(deliveryMeal => (
                  <CartMealGroup
                    key={deliveryMeal.IdKey}
                    onAddMeal={() => addMealToCart(
                      deliveryMeal.mealId,
                      deliveryMeal,
                      deliveryMeal.Choices,
                      restId,
                      deliveryMeal.RestName,
                      deliveryMeal.TaxRate,
                      deliveryMeal.Hours,
                    )}
                    choices={deliveryMeal.Choices}
                    onRemoveMeal={() => removeMealFromCart(restId, deliveryMeal)}
                    name={deliveryMeal.Name}
                    img={deliveryMeal.Img}
                    quantity={deliveryMeal.Quantity}
                  />
                ))}
              </div>
            ))
            .reverse()
          }
          {
            donationCount > 0 &&
            <CartMealGroup
              name='Donation'
              img='/heartHand.png'
              quantity={donationCount}
            />
          }
        </>
      );
      const mealCount = cart ? Cart.getStandardMealCount(cart) : 0;
      const planPrices = summary.map(s => s.map(s2 => (
        <Grid
          container
          style={{
            marginBottom: isMd ? theme.spacing(1) : 0,
          }}
        >
          <Grid
            md={12}
            lg={6}
            item
          >
            <Typography
              color='primary'
              variant={s2.isActive ? 'h5' : 'body1'}
            >
              {s2.meals}
            </Typography>
          </Grid>
          <Grid
            md={12}
            lg={6}
            item
          >
            <Typography
              color='primary'
              variant={s2.isActive ? 'h5' : 'body1'}
            >
              {s2.price}
            </Typography>
          </Grid>
        </Grid>
      )));
      return (
        <>
          {
            !hideNext &&
            <>
              {planPrices}
              <Button
                disabled={disabled}
                variant='contained'
                color='primary'
                className={classes.button}
                fullWidth
                onClick={onNext}
              >
                {confirmText}
              </Button>
              <Typography variant='body1' className={classes.suggestion}>
                {cart && cart.Zip ? null : 'Enter zip to continue'}
              </Typography>
              {suggestions.map((suggestion, i) => (
                <Typography
                  key={i}
                  variant='body1'
                  className={classes.suggestion}
                >
                  {suggestion}
                </Typography>
              ))}
            </>
          }
          <div className={`${classes.row} ${classes.title}`}>
            <Typography variant='h4' color='primary'>
              {title}
            </Typography>
            <Typography
              variant='h4'
              color='primary'
              className={classes.count}
            >
              <ShoppingCartIcon />
              {mealCount}
            </Typography>
          </div>
          {meals}
        </>
      )
    }} />
  )
}

export default withClientApollo(SideMenuCart);