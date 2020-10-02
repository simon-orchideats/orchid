import { useGetAvailablePlans } from '../../plan/planService';
import withClientApollo from '../utils/withClientApollo';
import PlanDetails from './PlanDetails';
import { Grid, makeStyles } from '@material-ui/core';
import { useState, useEffect } from 'react';
import { IPlan } from '../../plan/planModel';
import { useSetPlan } from '../global/state/cartState';

const useStyles = makeStyles(() => ({
  item: {
    display: 'flex',
    justifyContent: 'center',
  },
}));

const PlanCards: React.FC<{
  defaultColor?: boolean,
  small?: boolean,
  defaultSelected?: IPlan | null
}> = ({
  defaultColor,
  small,
  defaultSelected,
}) => {
  const classes = useStyles();
  const plans = useGetAvailablePlans();
  const updateCartPlan = useSetPlan();
  const [selectedPlan, setSelectedPlan] = useState<IPlan | null | undefined>(defaultSelected)
  useEffect(() => {
    if (plans.data && selectedPlan === null) {
      updatePlan(plans.data[0])
    }
  }, [plans.data, selectedPlan]);
  if (!plans.data) {
    return <div>loading</div>
  }
  const updatePlan = (plan: IPlan) => {
    setSelectedPlan(plan);
    updateCartPlan(plan);
  }
  return (
    <Grid container justifyContent='center'>
      {plans.data.map(p => (
        <Grid
          key={p.stripeProductPriceId}
          item
          className={classes.item}
          xs={12}
          sm={4}
        >
          <PlanDetails
            key={p.stripeProductPriceId}
            plan={p}
            defaultColor={defaultColor}
            small={small}
            isSelected={selectedPlan?.stripeProductPriceId === p.stripeProductPriceId}
            onClick={selectedPlan ? (p: IPlan) => updatePlan(p) : undefined}
          />
        </Grid>
      ))}
    </Grid>
  )
}

export default withClientApollo(PlanCards)
