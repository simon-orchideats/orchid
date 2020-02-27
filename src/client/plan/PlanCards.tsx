import { makeStyles, Grid } from '@material-ui/core';
import { useGetAvailablePlans } from '../../plan/planService';
import withClientApollo from '../utils/withClientApollo';
import PlanDetails from './PlanDetails';
import { Plan } from '../../plan/planModel';
import { useState } from 'react';

const useStyles = makeStyles(() => ({
  item: {
    display: 'flex',
    justifyContent: 'center',
    cursor: 'pointer',
  },
}));

const PlanCards: React.FC <{
  isSelectable?: boolean;
  onClickCard?: (plan: Plan) => void;
}> = ({isSelectable=false, onClickCard=()=>{}}) => {
  const classes = useStyles();
  const plans = useGetAvailablePlans();
  const initialPlan = {
    stripeId:'',
    mealCount:0,
    mealPrice:0,
    weekPrice:0,
    StripeId:'',
    MealCount:0, 
    MealPrice:0,
    WeekPrice:0
  };
  const [selectedPlan, setSelectedPlan] = useState<Plan>(initialPlan);
 
  if (!plans.data) {
    return <div>loading</div>
  }
  return (
    <Grid container justify='center'>
      {plans.data.map(plan => (
        <Grid onClick={()=> onClickCard(plan)} key={plan.StripeId} item sm={12} md={4} className={classes.item}>
          <PlanDetails
            selected={isSelectable && selectedPlan && selectedPlan.StripeId === plan.StripeId}
            mealPlan={plan}
            onClick={plan => setSelectedPlan(plan)} 
          />
        </Grid>
      ))}
    </Grid>
  );
}

export default withClientApollo(PlanCards)
