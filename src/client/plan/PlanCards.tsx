import { makeStyles, Grid } from '@material-ui/core';
import { useGetAvailablePlans } from '../../plan/planService';
import withClientApollo from '../utils/withClientApollo';
import MealCard from './MealCard';
import { Plan  } from '../../plan/planModel';
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
  clickableGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    alignSelf: 'start',
  }
}));

const PlanCards = (props:any) => {
  const classes = useStyles();
  const plans = useGetAvailablePlans();
  const [mealPlan, setMealPlan] = useState<Plan>();
  if (!plans.data) {
    return <div>loading</div>
  }
  return (
    <>
      {props.isClickable ? (
         <Grid className={classes.clickableGrid}>
          {plans.data.map(plan => (
            <Grid  key={plan.StripeId} item sm={12} md={4} className={classes.item}>
              <div onClick={() => {
                if (props.isClickable){
                  setMealPlan(plan);
                }
              }}>
                <MealCard {...{plan,...props, mealPlan}}/>
              </div>
            </Grid>
          ))}
        </Grid>
      ): (
        <Grid container justify='center'>
          {plans.data.map(plan => (
            <Grid key={plan.StripeId}item sm={12} md={4} className={classes.item}>
              <MealCard {...{plan}}/>
            </Grid>
          ))}
       </Grid>
      )}
    </>
  );
}

export default withClientApollo(PlanCards)
