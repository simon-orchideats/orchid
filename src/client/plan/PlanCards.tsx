import { makeStyles, Grid } from '@material-ui/core';
import { useGetAvailablePlans } from '../../plan/planService';
import withClientApollo from '../utils/withClientApollo';
import PlanDetails from './PlanDetails';

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
    <>
      {plans.data.filter(p => p.IsActive).map(plan => (
        <Grid
          key={plan.StripePlanId}
          container
          justify='center'
        >
          {plan.Tiers.map(t => (
            <Grid
              key={t.MealPrice}
              item
              xs={12}
              sm={small ? 5 : 12}
              md={4}
              className={classes.item}
            >
              <PlanDetails
                tier={t}
                color={color}
                small={small}
              />
            </Grid>
          ))}
        </Grid>
      ))}
    </>
  );
}

export default withClientApollo(PlanCards)
