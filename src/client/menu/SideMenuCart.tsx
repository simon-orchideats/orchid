import { makeStyles, Typography, Button } from "@material-ui/core";
import withClientApollo from "../utils/withClientApollo";
import CartMealGroup from "../order/CartMealGroup";
import MenuCart from "./MenuCart";

const useStyles = makeStyles(theme => ({
  group: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: theme.spacing(2),
  },
  img: {
    width: 55,
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
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
}));

const SideMenuCart: React.FC = () => {
  const classes = useStyles();
  return (
    <MenuCart
      render={(
      cart,
      _sortedPlans,
      disabled,
      onNext,
      rest,
      suggestion
    ) => (
      <>
        <Typography
          variant='h4'
          color='primary'
          className={classes.title}
        >
          {rest.data ? `Meals from ${rest.data.Profile.Name}` : 'Your meals'}
        </Typography>
        {cart && cart.Meals && cart.Meals.map(mealGroup => (
          <CartMealGroup key={mealGroup.MealId} mealGroup={mealGroup} />
        ))}
        <div className={classes.bottom}>
          <Typography variant='body1' className={classes.suggestion}>
            {suggestion}
          </Typography>
          <Typography variant='body1' className={classes.suggestion}>
            {cart && cart.Zip ? null : 'Enter zip to continue'}
          </Typography>
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
        </div>
      </>
    )} />
  )
}

export default withClientApollo(SideMenuCart);