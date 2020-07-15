import { makeStyles, Typography, Button } from "@material-ui/core";
import withClientApollo from "../utils/withClientApollo";
import CartMealGroup from "../order/CartMealGroup";
import MenuCart from "./MenuCart";
import { useAddMealToCart, useRemoveMealFromCart } from "../global/state/cartState";

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
  }
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
      return (
        <>
          {
            !hideNext &&
            <>
              {summary.map((s, i) => (
                <Typography
                  key={i}
                  variant={i === 0 ? 'h6' : 'body1'}
                  color='primary'
                  className={classes.summary}
                >
                  {s}
                </Typography>
              ))}
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
          <Typography
            variant='h4'
            color='primary'
            className={classes.title}
          >
            {title}
          </Typography>
          {meals}
        </>
      )
    }} />
  )
}

export default withClientApollo(SideMenuCart);