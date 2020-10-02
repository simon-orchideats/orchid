import { useGetAvailablePlans } from '../../plan/planService';
import withClientApollo from '../utils/withClientApollo';
import PlanDetails from './PlanDetails';
import { Grid, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  item: {
    display: 'flex',
    justifyContent: 'center',
  },
}));

const PlanCards: React.FC<{
  color?: string,
  small?: boolean,
}> = ({
  color,
  small,
}) => {
  const classes = useStyles();
  const plans = useGetAvailablePlans();
  if (!plans.data) {
    return <div>loading</div>
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
            color={color}
            small={small}
          />
        </Grid>
      ))}
    </Grid>
  )
}

export default withClientApollo(PlanCards)
