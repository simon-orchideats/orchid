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
    borderColor: color === 'black' ? theme.palette.primary.main : '#ed8d81',
  }),
  cardSubtitle: {
    color: theme.palette.text.secondary,
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
    <Typography variant='h6'>
      {tier.minMeals}+ meals
    </Typography>
  );
  const price = (
    <Typography variant='body1' className={classes.cardSubtitle}>
      ${(tier.MealPrice / 100).toFixed(2)}/meal
    </Typography>
  )
  return (
    <Card className={classes.card}>
      <CardContent>
        {
          tier.minMeals === 4 &&
          <>
            <Typography variant='h6' color='primary'>
              Personal Week
            </Typography>
            {meals}
            <Typography variant='h6'>
              1 free delivery
            </Typography>
            {price}
          </>
        }
        {
          tier.minMeals === 8 &&
          <>
            <Typography variant='h6' color='primary'>
              Roomies Week
            </Typography>
            {meals}
            <Typography variant='h6'>
              2 deliveries
            </Typography>
            {price}
          </>
        }
        {
          tier.minMeals === 12 &&
          <>
            <Typography variant='h6' color='primary'>
              Family Week
            </Typography>
            {meals}
            <Typography variant='h6'>
              3+ deliveries
            </Typography>
            {price}
          </>
        }
      </CardContent>
    </Card>
  );
}

export default PlanDetails;