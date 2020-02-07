import { makeStyles, Typography, Button } from "@material-ui/core";
import { useGetCart } from "../global/state/cartState";
import { useGetAvailablePlans } from "../../plan/planService";
import withClientApollo from "../utils/withClientApollo";
import { getSuggestion } from "./utils";
import { Plan } from "../../plan/planModel";
import Link from 'next/link'
import { deliveryRoute } from "../../pages/delivery";

const useStyles = makeStyles(theme => ({
  suggestion: {
    color: theme.palette.warning.main,
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
  button: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  container: {
    display: 'flex',
    alignItems: 'center',
  },
}));

const MenuMiniCart: React.FC = () => {
  const classes = useStyles();
  const cart = useGetCart();
  const sortedPlans = useGetAvailablePlans();
  const planCounts = Plan.getPlanCounts(sortedPlans.data);
  const mealCount = cart ? cart.Meals.length : 0;
  const disabled = !cart || !cart.Zip || mealCount === 0 || (planCounts && !planCounts.includes(mealCount))
  return (
    <div className={classes.container}>
      <Typography variant='body1' className={classes.suggestion}>
        {cart && cart.Zip ? getSuggestion(mealCount, sortedPlans.data) : 'Enter zip to continue'}
      </Typography>
      <Link href={deliveryRoute}>
        <Button
          disabled={disabled}
          variant='contained'
          color='primary'
          className={classes.button}
        >
          {disabled ? 'Next' : `Next w/ ${mealCount} meals`}
        </Button>
      </Link>
    </div>
  )
}

export default withClientApollo(MenuMiniCart);