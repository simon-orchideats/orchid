import { makeStyles, Grid } from '@material-ui/core';
import { useGetAvailablePlans } from '../../plan/planService';
import withClientApollo from '../utils/withClientApollo';
import PlanDetails from './PlanDetails';
import { Plan } from '../../plan/planModel';
import { useState } from 'react';
import Router from 'next/router';
import { menuRoute } from '../../pages/menu';
import { useUpdateCartPlanId } from '../global/state/cartState';

const useStyles = makeStyles(() => ({
  item: {
    display: 'flex',
    justifyContent: 'center',
    cursor: 'pointer',
  },
}));

const PlanCards = ({isSelectable}:{isSelectable:boolean}) => {
  const classes = useStyles();
  const plans = useGetAvailablePlans();
  const [selectedPlan, setSelectedPlan] = useState<Plan>();
  const setCartStripePlanId = useUpdateCartPlanId();
  if (!plans.data) {
    return <div>loading</div>
  }
  const onClick = (id: string) => {
    Router.push(menuRoute);
    setCartStripePlanId(id);
  };
  return (
    <Grid container justify='center'>
      {plans.data.map(plan => (
        <Grid key={plan.StripeId} item sm={12} md={4} className={classes.item}>
          <div onClick={() =>{
            setSelectedPlan(plan)
            onClick(plan.StripeId) 
          }}>
            <PlanDetails
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
