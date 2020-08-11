import { Card, CardContent, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { Tier } from '../../plan/planModel';

const useStyles = makeStyles(theme => ({
  card: ({ color, small }: { color: string, small: boolean }) => ({
    textAlign: 'center',
    marginLeft: theme.spacing(small ? 0 : 3),
    marginRight: theme.spacing(small ? 1 : 3),
    marginTop: theme.spacing(small ? 0 : 1),
    marginBottom: theme.spacing(1),
    paddingLeft: theme.spacing(small ? 0 : 2),
    paddingRight: theme.spacing(small ? 0 : 2),
    width: small ? 200 : 260,
    borderStyle: 'solid',
    borderColor: color === 'black' ? theme.palette.primary.main : theme.palette.common.pink,
  }),
  title: {
    paddingBottom: theme.spacing(1),
  },
  deliveries: {
    paddingTop: theme.spacing(1),
    color: theme.palette.text.secondary,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

const PlanDetails: React.FC<{
  tier: Tier;
  color?: string,
  small?: boolean,
}> = ({
  tier,
  color = 'default',
  small = false
}) => {
  const classes = useStyles({ color, small });
  const meals = (
    <Typography variant='h6' className={classes.title}>
      <b>{tier.MinMeals}{tier.MaxMeals ? ` - ${tier.MaxMeals}` : '+'} meals</b> a week
    </Typography>
  );
  const price = (
    <Typography variant='h6'>
      <b>${(tier.MealPrice / 100).toFixed(2)}</b> / meal
    </Typography>
  )
  return (
    <Card className={classes.card}>
      <CardContent>
        {
          tier.minMeals === 4 &&
          <>
            <Typography
              variant='h6'
              color='primary'
              className={classes.title}
            >
              Personal
            </Typography>
            {meals}
            {price}
            <Typography variant='h6' className={classes.deliveries}>
              1 free delivery
            </Typography>
          </>
        }
        {
          tier.minMeals === 8 &&
          <>
            <Typography
              variant='h6'
              color='primary'
              className={classes.title}
            >
              Roomies
            </Typography>
            {meals}
            {price}
            <Typography variant='h6' className={classes.deliveries}>
              2 deliveries
            </Typography>
          </>
        }
        {
          tier.minMeals === 12 &&
          <>
            <Typography
              variant='h6'
              color='primary'
              className={classes.title}
            >
              Family
            </Typography>
            {meals}
            {price}
            <Typography variant='h6' className={classes.deliveries}>
              3+ deliveries
            </Typography>
          </>
        }
      </CardContent>
    </Card>
  );
}

export default PlanDetails;