import { makeStyles, Grid } from '@material-ui/core';
import { useGetAvailablePlans } from '../../plan/planService';
import { Card, CardContent, Typography } from '@material-ui/core';
import withClientApollo from '../utils/withClientApollo';

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
}));

const PlanCards = () => {
  const classes = useStyles();
  const plans = useGetAvailablePlans();
  if (!plans.data) {
    return <div>loading</div>
  }
  return (
    <Grid container justify='center'>
      {plans.data.map(plan => (
        <Grid key={plan.StripeId}item sm={12} md={4} className={classes.item}>
          <Card key={plan.MealPrice} className={classes.card}>
            <CardContent>
              <Typography variant='h6'>
                {plan.MealCount} meals/week
              </Typography>
              <Typography variant='body2' color='textSecondary'>
                ${plan.MealPrice.toFixed(2)}/meal
              </Typography>
              <Typography variant='body2' color='textSecondary'>
                ${plan.WeekPrice.toFixed(2)}/week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default withClientApollo(PlanCards)
