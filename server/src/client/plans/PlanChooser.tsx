import { makeStyles, Button } from '@material-ui/core';
import { isServer } from '../utils/isServer';
import { useGetAvailablePlans } from '../global/state/plans/planService';
import { Card, CardContent, Typography } from '@material-ui/core';
import withClientApollo from '../utils/withClientApollo';

const useStyles = makeStyles(theme => ({
  row: {
    paddingTop: theme.spacing(1),
    display: 'flex',
    justifyContent: 'space-around',
  },
  card: {
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  button: {
    marginTop: theme.spacing(2),
  },
}));

const PlanChooser = () => {
  if (isServer()) return null;
  const classes = useStyles();
  const plans = useGetAvailablePlans();
  if (!plans.data) {
    return <div>loading</div>
  }
  return (
    <div className={classes.row}>
      {plans.data.map(plan => (
        <Card key={plan.MealPrice} className={classes.card}>
          <CardContent>
            <Typography variant='h6'>
              {plan.MealCount} meals/week
            </Typography>
            <Typography variant='body2' color='textSecondary'>
              ${plan.MealPrice}/meal
            </Typography>
            <Typography variant='body2' color='textSecondary'>
              ${plan.WeekPrice}/week
            </Typography>
            <Button className={classes.button} variant='contained' color='primary'>CHOOSE</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default withClientApollo(PlanChooser)
