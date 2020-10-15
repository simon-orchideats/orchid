import { useGetAvailablePlans } from '../../plan/planService';
import withClientApollo from '../utils/withClientApollo';
import PlanDetails from './PlanDetails';
import { Grid, makeStyles } from '@material-ui/core';
import { useState, useEffect } from 'react';
import { IPlan } from '../../plan/planModel';

const useStyles = makeStyles(() => ({
  item: {
    display: 'flex',
    justifyContent: 'center',
  },
}));

const PlanCards: React.FC<{
  defaultColor?: boolean,
  hideTrial?: boolean
  small?: boolean,
  selected?: string | null,
  showFirstOnly: boolean
  renderButton?: (p: IPlan) => React.ReactNode,
  onClickCard?: (p: IPlan) => void
  onLoad?: (plans: IPlan[]) => void
}> = ({
  defaultColor,
  small,
  selected,
  showFirstOnly = false,
  renderButton,
  onClickCard,
  onLoad,
  hideTrial,
}) => {
  const classes = useStyles();
  const [didLoad, setDidLoad] = useState<boolean>(false);
  const plans = useGetAvailablePlans();
  const [selectedPlan, setSelectedPlan] = useState<string | null | undefined>(selected)
  useEffect(() => {
    if (plans.data) {
      if (onLoad && !didLoad) {
        onLoad(plans.data);
        setDidLoad(true)
      }
      if (selectedPlan === null) {
        setSelectedPlan(plans.data[0].stripeProductPriceId)
      }
    }
  }, [plans.data, onLoad, didLoad]);
  if (!plans.data) {
    return <div>loading</div>
  }
  const updatePlan = (plan: IPlan) => {
    setSelectedPlan(plan.stripeProductPriceId);
    if (onClickCard) onClickCard(plan);
  }
  return (
    <Grid container justifyContent='center'>
      {plans.data.map((p, i) => (
        <Grid
          key={p.stripeProductPriceId}
          item
          className={classes.item}
          xs={12}
          sm={4}
        >
          {
            (showFirstOnly && i) > 0 ?
              null
            :
            <PlanDetails
              key={p.stripeProductPriceId}
              plan={p}
              hideTrial={hideTrial}
              defaultColor={defaultColor}
              small={small}
              isSelected={selected ? selected === p.stripeProductPriceId : selectedPlan === p.stripeProductPriceId}
              onClickCard={updatePlan}
              renderButton={renderButton}
            />
          }
        </Grid>
      ))}
    </Grid>
  )
}

export default withClientApollo(PlanCards)
