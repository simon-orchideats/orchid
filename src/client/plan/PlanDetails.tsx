import { Card, CardContent, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { Tier } from '../../plan/planModel';

const useStyles = makeStyles(theme => ({
  card: {
    textAlign: 'center',
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    width: 260,
    borderRadius: 50,
    borderStyle: 'solid',
    borderColor: theme.palette.primary.main,
  },
  cardSubtitle: {
    color: theme.palette.text.secondary,
  },
}));

const PlanDetails: React.FC<{
  tier: Tier;
}> = ({ tier }) => {
  const classes = useStyles();
  return (
    <Card className={classes.card}>
      <CardContent>
        {
          tier.minMeals === 4 &&
          <Typography variant='h6' color='primary'>
            Personal
          </Typography>
        }
        {
          tier.minMeals === 8 &&
          <Typography variant='h6' color='primary'>
            Roomies
          </Typography>
        }
        {
          tier.minMeals === 12 &&
          <Typography variant='h6' color='primary'>
            Family
          </Typography>
        }
        <Typography variant='h6'>
          {tier.minMeals}{tier.MaxMeals !== null ? ` - ${tier.maxMeals} meals a week` : '+ meals a week'}
        </Typography>
        <Typography variant='body1' className={classes.cardSubtitle}>
          ${(tier.MealPrice / 100).toFixed(2)}/meal
        </Typography>
      </CardContent>
    </Card>
  );
}

export default PlanDetails;