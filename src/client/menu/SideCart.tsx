import { makeStyles, Typography, Button, Grid } from "@material-ui/core";
import { useGetCart } from "../global/state/cartState";
import { useGetRest } from "../../rest/restService";
import { Meal } from "../../rest/mealModel";
import { useGetAvailablePlans } from "../../plan/planService";
import withClientApollo from "../utils/withClientApollo";
import { getSuggestion } from "./utils";
import { Plan } from "../../plan/planModel";

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
  container: {
    overflowY: 'scroll',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
  },
  bottom: {
    marginTop: 'auto',
  },
}));

const SideCart: React.FC = () => {
  const classes = useStyles();
  const cart = useGetCart();
  const sortedPlans = useGetAvailablePlans();
  const planCounts = Plan.getPlanCounts(sortedPlans.data);
  const rest = useGetRest(cart ? cart.RestId : null);
  const mealCount = cart ? cart.Meals.length : 0;
  const disabled = mealCount === 0 || (planCounts && !planCounts.includes(mealCount));
  const groupedMeals = cart && cart.Meals.reduce<{
    count: number,
    meal: Meal,
  }[]>((groupings, meal) => {
    const groupIndex = groupings.findIndex(group => group.meal.Id === meal.Id);
    if (groupIndex === -1) {
      groupings.push({
        count: 1,
        meal,
      })
    } else {
      groupings[groupIndex].count++;
    }
    return groupings;
  }, []);
  return (
    <div className={classes.container}>
      <Typography
        variant='h4'
        color='primary'
        className={classes.title}
      >
        {rest.data ? `Meals from ${rest.data.Profile.Name}` : 'Your meals'}
      </Typography>
        {groupedMeals && groupedMeals.map(mealGroup => (
          <Grid container key={mealGroup.meal.Id} className={classes.group}>
            <Grid item sm={1}>
              <Typography variant='body1'>
                {mealGroup.count}
              </Typography>
            </Grid>
            <Grid item sm={4}>
              <img
                src={mealGroup.meal.Img}
                alt={mealGroup.meal.Img}
                className={classes.img}
              />
            </Grid>
            <Grid item sm={7}>
              <Typography variant='h6'>
                {mealGroup.meal.Name.toUpperCase()}
              </Typography>
            </Grid>
          </Grid>
        ))}
      <div className={classes.bottom}>
        <Typography variant='body1' className={classes.suggestion}>
          {getSuggestion(mealCount, sortedPlans.data)}
        </Typography>
        <Button
          disabled={disabled}
          variant='contained'
          color='primary'
          className={classes.button}
          fullWidth
        >
          {disabled ? 'Next' : `Next w/ ${mealCount} meals`}
        </Button>
      </div>
    </div>
  )
}

export default withClientApollo(SideCart);