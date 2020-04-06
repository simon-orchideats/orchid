import { Card, CardContent, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { Plan } from '../../plan/planModel';

const useStyles = makeStyles(theme => ({
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
  cardSubtitle: {
    color: theme.palette.text.secondary,
  },
}));

const PlanDetails: React.FC<{
  mealPlan: Plan;
}> = ({ mealPlan }) => {
  const classes = useStyles();
  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant='h6'>
          {mealPlan.minMeals}{mealPlan.MaxMeals !== null ? ` - ${mealPlan.maxMeals} meals a week` : '+ meals a week'}
        </Typography>
        <Typography variant='body1' className={classes.cardSubtitle}>
          ${(mealPlan.MealPrice / 100).toFixed(2)}/meal
        </Typography>
      </CardContent>
    </Card>
  );
}

export default PlanDetails;