import { makeStyles, Grid } from '@material-ui/core';
import { useGetAvailablePlans } from '../../plan/planService';
import withClientApollo from '../utils/withClientApollo';
import MealCard from './MealCard';
import { IPlan  } from '../../plan/planModel';
import { useState } from 'react';
const useStyles = makeStyles(theme => ({
  item: {
    display: 'flex',
    justifyContent: 'center',
  },
  card: {
    textAlign: 'center',
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    width: 250,
  },
}));

const PlanCards = (props:any) => {
  console.log(props.isClickable)
  const isClickable = {...props};
  const classes = useStyles();
  const plans = useGetAvailablePlans();
  let clickedMealCard:IPlan =
  {
    stripeId: '',
    mealCount: 0,
    mealPrice: 0,
    weekPrice: 0,
  }
  console.log(clickedMealCard)
  const [mealPlan, setMealPlan] = useState<IPlan>();
  console.log(mealPlan);
  if (!plans.data) {
    return <div>loading</div>
  }
  return (
    <Grid container justify='center'>
      {plans.data.map(plan => (
        <Grid key={plan.StripeId}item sm={12} md={4} className={classes.item}>
          <div onClick={() => {
      if (props.isClickable){
        console.log("test");
        let mealPlan:IPlan = {...plan};
        clickedMealCard =  {...mealPlan}
        setMealPlan(mealPlan);
      }
      }}>
          <MealCard  {...{plan, ...isClickable, ...mealPlan}}/>
          </div>
        </Grid>
      ))}
    </Grid>
  );
}

export default withClientApollo(PlanCards)
