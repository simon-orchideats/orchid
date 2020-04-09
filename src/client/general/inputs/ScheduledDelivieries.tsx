import { makeStyles, Paper } from "@material-ui/core";
import { DeliveryInput } from "../../../order/deliveryModel";

const useStyles = makeStyles(theme => ({
  paper: {
    backgroundColor: theme.palette.common.white,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
}));

const ScheduleDeliveries: React.FC<{
  deliveries: DeliveryInput[]
}> = ({
  deliveries,
}) => {
  const classes = useStyles();
  return (
    <>
      {deliveries.map(d => (
        <Paper className={classes.paper}>
          {d.Meals.map(m => (
            <>
              {m.Quantity} {m.Name}
            </>
          ))}
        </Paper>
      ))}
    </>
  )
}

export default ScheduleDeliveries;
