import { makeStyles, Button, Grid } from '@material-ui/core';
import { isServer } from '../utils/isServer';
import { useGetAvailablePlans } from '../global/state/plans/planService';
import { Card, CardContent, Typography } from '@material-ui/core';
import withClientApollo from '../utils/withClientApollo';

const useStyles = makeStyles(theme => ({
  item: {
    display: 'flex',
    justifyContent: 'center',
  },
  card: {
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    width: 250,
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
    <Grid container>
      {plans.data.map(plan => (
        <Grid item sm={12} md={4} className={classes.item}>
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
        </Grid>
      ))}
    </Grid>
  );
}

export default withClientApollo(PlanChooser)
