import { makeStyles, Typography, Button, Slide } from "@material-ui/core";
import MenuCart from "./MenuCart";
import { useAddMealToCart, useRemoveMealFromCart } from "../global/state/cartState";
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import { Cart } from "../../order/cartModel";

const useStyles = makeStyles(theme => ({
  suggestion: {
    fontWeight: 600,
    color: theme.palette.warning.dark,
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
  margin: {
    marginTop: theme.spacing(1),
  },
  scrollable: {
    overflowX: 'scroll',
  },
  bar: {
    display: 'flex',
    alignItems: 'center',
    width: '100%'
  },
  col: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  summary: {
    fontWeight: 600,
    whiteSpace: 'pre'
  },
  heart: {
    height: 24,
  },
  popper: {
    width: 300,
    padding: theme.spacing(2),
  },
  icon: {
    paddingLeft: 0,
  },
  name: {
    overflowY: 'scroll',
    maxHeight: 40
  },
  next: {
    marginLeft: 'auto',
  },
  meals: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 150,
  },
  count: {
    marginLeft: theme.spacing(2),
  },
}));

const MenuMiniCart: React.FC<{
  hideNext?: boolean,
  filter: React.ReactNode,
}> = ({
  hideNext = false,
  filter,
}) => {
  const classes = useStyles();
  const addMealToCart = useAddMealToCart();
  const removeMealFromCart = useRemoveMealFromCart();
  if (hideNext) return null;
  return (
    <MenuCart
      render={(
      cart,
      disabled,
      onNext,
      suggestions,
      summary,
      _donationCount,
      _incrementDonationCount,
      _decrementDonationCount,
      _title,
      confirmText,
    ) => {
      const numMeals = cart ? Cart.getStandardMealCount(cart) : 0;
      return (
        <div className={classes.col}>
          <div className={`${classes.bar} ${classes.margin}`}>
            {filter}
            <Typography
              variant='h6'
              color='primary'
              className={classes.count}
            >
              {
                numMeals === 1 ? `${numMeals} meal` : `${numMeals} meals`
              }
            </Typography>
            <Button
              className={classes.next}
              disabled={disabled}
              variant='contained'
              color='primary'
              onClick={onNext}
            >
              {confirmText}
            </Button>
          </div>
          <div className={`${classes.bar} ${classes.scrollable}`}>
            {cart && cart.AllMeals.map(deliveryMeal => (
              <Slide
                key={deliveryMeal.IdKey}
                direction='up'
                in={true}
                timeout={{
                  enter: 500,
                }}
              >
                <div className={classes.meals}>
                  <div className={classes.bar}>
                    <Button
                      size='small'
                      variant='text'
                      color='primary'
                      onClick={() => addMealToCart(
                        deliveryMeal.MealId,
                        deliveryMeal,
                        deliveryMeal.Choices,
                        deliveryMeal.RestId,
                        deliveryMeal.RestName,
                        deliveryMeal.TaxRate,
                        deliveryMeal.Hours,
                      )}
                    >
                      <AddIcon />
                      </Button>
                    <Typography variant='subtitle2'>
                      {deliveryMeal.Quantity}
                    </Typography>
                    <Button
                      size='small'
                      variant='text'
                      onClick={() => removeMealFromCart(deliveryMeal.RestId, deliveryMeal)}
                    >
                      <RemoveIcon />
                    </Button>
                  </div>
                  <Typography
                    className={classes.name}
                    variant='body2'
                    align='center'
                  >
                    {deliveryMeal.Name}
                  </Typography>
                </div>
              </Slide>
            ))}
          </div>
          {(!cart || !cart.Zip) && (
            <Typography variant='body1' className={classes.suggestion}>
              Enter zip to continue
            </Typography>
          )}
          {
            summary.length > 0 && summary.map(s => s.map(s2 => (
              <Typography
                variant={s2.isActive ? 'h6' : 'body1'}
                color={s2.isActive ? 'primary' : 'inherit'}
              >
                {s2.meals} @ {s2.price}
              </Typography>
            )))
          }
          {cart && cart.Zip && suggestions.map((suggestion, i) => 
            <Typography
              key={i}
              variant='body1'
              className={classes.suggestion}
            >
              {suggestion}
            </Typography>
          )}
        </div>
      )
    }} />
  )
}

export default MenuMiniCart;