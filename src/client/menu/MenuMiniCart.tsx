import { makeStyles, Typography, Button, IconButton, Popover, Paper } from "@material-ui/core";
import MenuCart from "./MenuCart";
import Counter from "./Counter";
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import { useState } from "react";
import { useAddMealToCart, useRemoveMealFromCart } from "../global/state/cartState";
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';

const useStyles = makeStyles(theme => ({
  suggestion: {
    color: theme.palette.warning.main,
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
  button: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
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
  meals: {
    display: 'flex',
    flexDirection: 'column',
    textOverflow: 'ellipsis',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 150,
  }
}));

const MenuMiniCart: React.FC<{
  hideNext?: boolean,
  filter: React.ReactNode,
}> = ({
  hideNext = false,
  filter,
}) => {
  const classes = useStyles();
  const [helpAnchor, setHelpAnchor] = useState<null | HTMLElement>(null);
  const handleHelp = (event: React.MouseEvent<HTMLElement>) => {
    setHelpAnchor(helpAnchor ? null : event.currentTarget);
  };
  const isHelperOpen = Boolean(helpAnchor);
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
      _summary,
      donationCount,
      incrementDonationCount,
      decrementDonationCount,
      _title,
      confirmText,
    ) => (
      <div className={classes.col}>
        <div className={classes.bar}>
          <Popover
            open={isHelperOpen}
            anchorEl={helpAnchor}
            onClose={() => setHelpAnchor(null)} 
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
          >
            <Paper className={classes.popper}>
              <Typography variant='body1'>
                Orchid matches every donation you make from your meal plan. So if you choose the 12 meal plan and
                donate 3 meals, we'll deliver 9 meals to you and 3 meals to a NYC hospital. We'll donate another
                3 meals on us so we can all help our heros on the frontline.
              </Typography>
            </Paper>
          </Popover>
          {filter}
          <Counter
            subtractDisabled={!donationCount}
            onClickSubtract={decrementDonationCount}
            subractIcon={
              donationCount ?
              <img src='menu/heartMinus.png' className={classes.heart} alt='heart' />
              :
              <img src='menu/heartMinusDisabled.png' className={classes.heart} alt='heart' />
            }
            chipLabel={donationCount}
            chipDisabled={!donationCount}
            onClickAdd={incrementDonationCount}
            addIcon={<img src='menu/heartPlus.png' className={classes.heart} alt='heart' />}
          />
          <IconButton
            color='primary'
            onClick={handleHelp}
            className={classes.icon}
          >
            <HelpOutlineIcon />
          </IconButton>
          <Button
            disabled={disabled}
            variant='contained'
            color='primary'
            className={classes.button}
            onClick={onNext}
          >
            {confirmText}
          </Button>
        </div>
        <div className={`${classes.bar} ${classes.scrollable}`}>
          {cart && Object.entries(cart.RestMeals).map(([restId, restMeals]) => (
            restMeals.meals.map(deliveryMeal => (
              <div className={classes.meals} key={deliveryMeal.mealId}>
                <div className={classes.bar}>
                  <Button
                    size='small'
                    variant='text'
                    color='primary'
                    onClick={() => addMealToCart(
                      deliveryMeal.mealId,
                      deliveryMeal,
                      restId,
                      deliveryMeal.RestName,
                      deliveryMeal.TaxRate
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
                    onClick={() => removeMealFromCart(restId, deliveryMeal.mealId)}
                  >
                    <RemoveIcon />
                  </Button>
                </div>
                <Typography variant='body2' align='center'>
                  {deliveryMeal.name.toUpperCase()}
                </Typography>
              </div>
            ))
          ))}
        </div>
        {(!cart || !cart.Zip) && (
          <Typography variant='body1' className={classes.suggestion}>
            Enter zip to continue
          </Typography>
        )}
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
    )} />
  )
}

export default MenuMiniCart;