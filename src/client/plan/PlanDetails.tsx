import { Card, CardContent, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { Plan } from '../../plan/planModel';

const useStyles = makeStyles(theme => ({
  card: ({ selected }: { selected: boolean }) => ({
    backgroundColor: selected ? theme.palette.primary.main : undefined,
    color: selected ? theme.palette.common.white : undefined,
    textAlign: 'center',
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    width: 250,
  }),
  cardSubtitle: ({ selected }: { selected: boolean }) => ({
    color: selected ? theme.palette.background.default: theme.palette.text.secondary,
  }),
}));

const PlanDetails: React.FC<{
  mealPlan: Plan;
  selected: boolean;
  onClick: (plan: Plan) => void;
}> = ({selected = false, mealPlan, onClick}) => {
  const classes = useStyles({ selected });
  return (
    <Card onClick={() => onClick(mealPlan)} key={mealPlan.mealPrice} className={classes.card}>
      <CardContent>
        <Typography variant='h6'>
          {mealPlan.mealCount} meals/week
        </Typography>
        <Typography variant='body2' className={classes.cardSubtitle}>
          ${mealPlan.mealPrice.toFixed(2)}/meal
        </Typography>
        <Typography variant='body2' className={classes.cardSubtitle}>
          ${mealPlan.weekPrice.toFixed(2)}/week
        </Typography>
      </CardContent>
    </Card>
  );
}

export default PlanDetails;