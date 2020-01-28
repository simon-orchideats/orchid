import { makeStyles, Typography, Button } from "@material-ui/core";
import { useGetCart } from "../global/state/cartState";
import { useGetAvailablePlans } from "../../plan/planService";
import withClientApollo from "../utils/withClientApollo";
import { getSuggestion } from "./utils";
import { Plan } from "../../plan/planModel";

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

const MiniCart: React.FC = () => {
  const classes = useStyles();
  const cart = useGetCart();
  const sortedPlans = useGetAvailablePlans();
  const planCounts = Plan.getPlanCounts(sortedPlans.data);
  const mealCount = cart ? cart.Meals.length : 0;
  const disabled = mealCount === 0 || (planCounts && !planCounts.includes(mealCount));
  return (
    <div className={classes.container}>
      <Typography variant='body1' className={classes.suggestion}>
        {getSuggestion(mealCount, sortedPlans.data)}
      </Typography>
      <Button
        disabled={disabled}
        variant='contained'
        color='primary'
        className={classes.button}
      >
        {disabled ? 'Next' : `Next w/ ${mealCount} meals`}
      </Button>
    </div>
  )
}

export default withClientApollo(MiniCart);