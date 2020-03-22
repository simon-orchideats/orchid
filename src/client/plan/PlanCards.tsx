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
  defaultPlanId?: string;
  isSelectable?: boolean;
  onClickCard?: (plan: Plan) => void
}> = ({
  defaultPlanId,
  isSelectable =  false,
  onClickCard = (_plan: Plan) => {}
}) => {
  const classes = useStyles();
  const plans = useGetAvailablePlans();
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>(defaultPlanId);
 
  if (!plans.data) {
    return <div>loading</div>
  }
  return (
    <Grid container justify='center'>
      {plans.data.map(plan => (
        <Grid key={plan.StripeId} item sm={12} md={4} className={classes.item}>
          <PlanDetails
            selected={isSelectable && !!selectedPlanId && selectedPlanId === plan.StripeId}
            mealPlan={plan}
            onClick={() => {
              onClickCard(plan);
              setSelectedPlanId(plan.StripeId);
            }}
          />
        </Grid>
      ))}
    </Grid>
  );
}

export default withClientApollo(PlanCards)
