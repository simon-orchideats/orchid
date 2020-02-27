import { Card, CardContent, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { Plan } from '../../plan/planModel';

const useStyles = makeStyles(theme => ({
  card: ({ selected }: { selected: boolean | undefined }) => ({
    backgroundColor: selected ? theme.palette.primary.main : '',
    color: selected ? 'white' : '',
    textAlign: 'center',
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    width: 250,
  }),
  cardSubtitle: ({ selected }: { selected: boolean | undefined }) => ({
    color: selected ? theme.palette.grey['300'] : theme.palette.text.secondary,
  }),
}));
interface mealCardProps {
  mealPlan?: Plan | undefined;
  selected: boolean | undefined;
}

const MealCard = (props:mealCardProps) => {
  const { selected } = props;
  const classes = useStyles({selected});
  return (
    <Card key={props.mealPlan?.mealPrice} className={classes.card}>
      <CardContent>
        <Typography variant='h6'>
          {props.mealPlan?.mealCount} meals/week
        </Typography>
        <Typography variant='body2' className={ classes.cardSubtitle}>
          ${props.mealPlan?.mealPrice.toFixed(2)}/meal
        </Typography>
        <Typography variant='body2' className={classes.cardSubtitle}>
          ${props.mealPlan?.weekPrice.toFixed(2)}/week
        </Typography>
      </CardContent>
    </Card>
  );
}

export default MealCard;