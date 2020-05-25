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
    color: theme.palette.warning.main,
  },
  button: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  bottom: {
    marginTop: 'auto',
  },
  heart: {
    height: 24,
  },
  popper: {
    width: 300,
    padding: theme.spacing(2),
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
      const meals = (
        <>
          {cart && Object.entries(cart.RestMeals).map(([restId, restMeals]) => (
            <div key={restId}>
              <Typography variant='h6'>
                {restMeals.meals[0].restName}
              </Typography>
              {restMeals.meals.map(deliveryMeal => (
                <CartMealGroup
                  onAddMeal={() => addMealToCart(
                    deliveryMeal.mealId,
                    deliveryMeal,
                    //todo simonv fix this from []
                    [],
                    restId,
                    deliveryMeal.RestName,
                    deliveryMeal.TaxRate
                  )}
                  onRemoveMeal={() => removeMealFromCart(restId, deliveryMeal.mealId)}
                  key={deliveryMeal.MealId}
                  mealId={deliveryMeal.MealId}
                  name={deliveryMeal.Name}
                  img={deliveryMeal.Img}
                  quantity={deliveryMeal.Quantity}
                />
              ))}
            </div>
          ))}
          {
            donationCount > 0 &&
            <CartMealGroup
              mealId='donations'
              name='Donation'
              img='/heartHand.png'
              quantity={donationCount}
            />
          }
        </>
      );
      return (
        <>
          <Typography
            variant='h4'
            color='primary'
            className={classes.title}
          >
            {title}
          </Typography>
          {hideNext && meals}
          {
            !hideNext &&
            <div className={classes.bottom}>
              {meals}
              <Typography variant='body1' color='primary'>
                {summary}
              </Typography>
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
            </div>
          }
        </>
      )
    }} />
  )
}

export default withClientApollo(SideMenuCart);