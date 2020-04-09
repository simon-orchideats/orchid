import { makeStyles, Paper } from "@material-ui/core";
import { IDeliveryMeal } from "../../../order/deliveryModel";

const useStyles = makeStyles(theme => ({
  paper: {
    backgroundColor: theme.palette.common.white,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
}));

const ScheduledMeals: React.FC<{
  meals: IDeliveryMeal[]
}> = ({
  meals,
}) => {
  const classes = useStyles();
  return (
    <Paper className={classes.paper}>
      {meals.map(m => m.name)}
    </Paper>
  )
}

export default ScheduledMeals;
