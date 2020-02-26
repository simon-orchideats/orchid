import { makeStyles, Grid } from '@material-ui/core';
import { useGetAvailablePlans } from '../../plan/planService';
import withClientApollo from '../utils/withClientApollo';
import MealCard from './MealCard';
import { Plan } from '../../plan/planModel';
import { useState } from 'react';

const useStyles = makeStyles(() => ({
  item: {
    display: 'flex',
    justifyContent: 'center',
  },
}));

const PlanCards = ({isSelectable}:{isSelectable:boolean}) => {
  const classes = useStyles();
  const plans = useGetAvailablePlans();
  const [selectedPlan, setSelectedPlan] = useState<Plan>();
  if (!plans.data) {
    return <div>loading</div>
  }
  return (
      <Grid container justify='center'>
        {plans.data.map(plan => (
          <Grid  key={plan.StripeId} item sm={12} md={4} className={classes.item}>
            <div onClick={() => setSelectedPlan(plan)}>
              <MealCard
                selected={isSelectable && selectedPlan && selectedPlan.StripeId === plan.StripeId}
                mealPlan={plan} 
              />
            </div>
          </Grid>
        ))}
    </Grid>
  );
}

export default withClientApollo(PlanCards)
