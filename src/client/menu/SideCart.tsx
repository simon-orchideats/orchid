import { makeStyles, Typography, Button } from "@material-ui/core";
import { useGetCart } from "../global/state/cartState";
import { useGetRest } from "../../rest/restService";
import { Meal } from "../../rest/mealModel";
import { useGetAvailablePlans } from "../../plan/planService";
import withClientApollo from "../utils/withClientApollo";
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

const getSuggestion = (currCount: number, plans?: Plan[]) => {
  if (!plans) return '';
  for (let i = 0; i < plans.length; i++) {
    const mealCount = plans[i].MealCount;
    if (currCount < mealCount) return `Add ${mealCount - currCount} more for ${plans[i].MealPrice.toFixed(2)} per meal`;
    if (currCount === mealCount && i === plans.length - 1) return '';
    if (currCount > mealCount && i === plans.length - 1) return `Remove ${currCount - mealCount}`;
  }
}

const SideCart: React.FC = () => {
  const classes = useStyles();
  const cart = useGetCart();
  const plans = useGetAvailablePlans();
  const sortedPlans = plans.data && plans.data.sort((p1, p2) => {
    if (p1.MealCount === p2.MealCount) return 0;
    if (p1.MealCount > p2.MealCount) return 1;
    return -1;
  })
  const planCounts = plans.data && plans.data.reduce<number[]>(((acc, plan) => [...acc, plan.mealCount]), [])
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
        <div key={mealGroup.meal.Id} className={classes.group}>
          <Typography variant='body1'>
            {mealGroup.count}
          </Typography>
          <img
            src={mealGroup.meal.Img}
            alt={mealGroup.meal.Img}
            className={classes.img}
          />
          <Typography variant='h6'>
            {mealGroup.meal.Name.toUpperCase()}
          </Typography>
        </div>
      ))}
      <div className={classes.bottom}>
        <Typography variant='body1' className={classes.suggestion}>
          {getSuggestion(mealCount, sortedPlans)}
        </Typography>
        <Button
          disabled={disabled}
          variant='contained'
          color='primary'
          className={classes.button}
          fullWidth
        >
          {disabled ? 'Continue' : `Continue w/ ${mealCount} meal plan`}
        </Button>
      </div>
    </div>
  )
}

export default withClientApollo(SideCart);