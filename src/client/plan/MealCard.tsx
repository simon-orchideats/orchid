import { Card, CardContent, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { IPlan} from '../../plan/planModel';
// import { useState } from 'react';

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
  cardSelectedSubtitle: {
    color: theme.palette.grey['300'],
   
  },
  cardSelected: {
    textAlign: 'center',
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    width: 250,
    backgroundColor: theme.palette.primary.main,
    color:"white",
  },
  cardSubtitle: {
    color: theme.palette.text.secondary,
  }
}));
interface mealCardProps {
  plan: IPlan;
  isClickable: boolean;
  mealPrice:number;
  onClick: () => void;
}
const MealCard = (props:mealCardProps) => {
  
  const classes = useStyles();

  console.log(props);
  return (
    <Card  key={props.plan.mealPrice} className={ props?.mealPrice == props.plan.mealPrice ? classes.cardSelected : classes.card}>
      <CardContent>
        <Typography variant='h6'>
          {props.plan.mealCount} meals/week
        </Typography>
        <Typography variant='body2' className={ props?.mealPrice == props.plan.mealPrice ? classes.cardSelectedSubtitle : classes.cardSubtitle}>
          ${props.plan.mealPrice.toFixed(2)}/meal
        </Typography>
        <Typography variant='body2' className={ props?.mealPrice == props.plan.mealPrice ? classes.cardSelectedSubtitle : classes.cardSubtitle}>
          ${props.plan.weekPrice.toFixed(2)}/week
        </Typography>
      </CardContent>
    </Card>
  );
}

export default MealCard;