import { makeStyles, Typography, Button, Popover, IconButton, Paper } from "@material-ui/core";
import withClientApollo from "../utils/withClientApollo";
import CartMealGroup from "../order/CartMealGroup";
import MenuCart from "./MenuCart";
import PlanFilter from "./PlanFilter";
import { useState } from "react";
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import { CartMeal } from "../../order/cartModel";
import Counter from "./Counter";

const useStyles = makeStyles(theme => ({
  group: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: theme.spacing(2),
  },
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
  donationText: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  donation: {
    flexDirection: 'column',
    alignItems: 'center',
    display: 'flex',
    marginBottom: theme.spacing(2),
  },
  donationCount: {
    alignSelf: 'stretch',
    display: 'flex',
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleHelp = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };
  const isHelperOpen = Boolean(anchorEl);
  return (
    <MenuCart
      render={(
      cart,
      disabled,
      onNext,
      rest,
      suggestion,
      donationCount,
      incrementDonationCount,
      decrementDonationCount,
      addDonationDisabled,
    ) => {
      const meals = (
        <>
          {cart && cart.Meals && cart.Meals.map(mealGroup => (
            <CartMealGroup key={mealGroup.MealId} mealGroup={mealGroup} />
          ))}
          {
            donationCount > 0 &&
            <CartMealGroup
              mealGroup={new CartMeal({
                mealId: 'donations',
                img: '/heartHand.png',
                name: 'Donation',
                quantity: donationCount
              })}
            />
          }
        </>
      )
      return (
        <>
          <Typography
            variant='h4'
            color='primary'
            className={classes.title}
          >
            {rest.data ? `Meals from ${rest.data.Profile.Name}` : 'Your meals'}
          </Typography>
            {hideNext && meals}
            {
              !hideNext &&
              <div className={classes.bottom}>
                {meals}
                <div className={classes.donation}>
                  <Typography className={classes.donationText} variant='body1'>
                    Donate meals from your plan
                    <IconButton color='primary' onClick={handleHelp}>
                      <HelpOutlineIcon />
                    </IconButton>
                  </Typography>
                  <Popover
                    open={isHelperOpen}
                    anchorEl={anchorEl}
                    onClose={() => setAnchorEl(null)} 
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
                  <div className={classes.donationCount}>
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
                      addDisabled={addDonationDisabled}
                      onClickAdd={incrementDonationCount}
                      addIcon={
                        addDonationDisabled ?
                        <img src='menu/heartPlusDisabled.png' className={classes.heart} alt='heart' />
                        :
                        <img src='menu/heartPlus.png' className={classes.heart} alt='heart' />
                      }
                    />
                  </div>
                </div>
                <PlanFilter />
                <Button
                  disabled={disabled}
                  variant='contained'
                  color='primary'
                  className={classes.button}
                  fullWidth
                  onClick={onNext}
                >
                  Next
                </Button>
                <Typography variant='body1' className={classes.suggestion}>
                  {cart && cart.Zip ? null : 'Enter zip to continue'}
                </Typography>
                <Typography variant='body1' className={classes.suggestion}>
                  {suggestion}
                </Typography>
              </div>
            }
        </>
      )
    }} />
  )
}

export default withClientApollo(SideMenuCart);