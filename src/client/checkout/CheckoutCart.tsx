import { makeStyles, Typography, Divider, Button } from "@material-ui/core";
import { useGetCart } from "../global/state/cartState";
import { useGetRest } from "../../rest/restService";
import withClientApollo from "../utils/withClientApollo";
import CartMealGroup from "../reused/CartMealGroup";

const useStyles = makeStyles(theme => ({
  title: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(1),
  },
  restName: {
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
}));

const MenuCart: React.FC = () => {
  const classes = useStyles();
  const cart = useGetCart();
  const rest = useGetRest(cart ? cart.RestId : null);
  const groupedMeals = cart && cart.getGroupedMeals();
  return (
    <>
      <Button variant='contained' color='primary'>
        Place order
      </Button>
      <Typography
        variant='h6'
        color='primary'
        className={classes.title}
      >
        Order summary
      </Typography>
      <Typography
        variant='h6'
        className={classes.restName}
      >
        {rest.data ? rest.data.Profile.Name : ''}
      </Typography>
      {groupedMeals && groupedMeals.map(mealGroup => (
        <CartMealGroup key={mealGroup.meal.Id} mealGroup={mealGroup} />
      ))}
      <Typography variant='body1'>
        Deliver on 12/12/20, 4pm - 9pm
      </Typography>
      <Typography variant='body1'>
        Deliver again on Sundays
      </Typography>
      <Divider className={classes.divider} />
      <div className={classes.summary}>
        <div className={classes.row}>
          <Typography variant='body1'>
            12 meal plan
          </Typography>
          <Typography variant='body1'>
            $107.99
          </Typography>
        </div>
        <div className={classes.row}>
          <Typography variant='body1' color='primary'>
            Shipping
          </Typography>
          <Typography variant='body1' color='primary'>
            <b>FREE</b>
          </Typography>
        </div>
        <div className={classes.row}>
          <Typography variant='body1' color='primary'>
            Today's total
          </Typography>
          <Typography variant='body1' color='primary'>
            $107.99
          </Typography>
        </div>
      </div>
    </>
  )
}

export default withClientApollo(MenuCart);