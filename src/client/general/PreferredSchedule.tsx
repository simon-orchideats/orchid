import { makeStyles, Button, Typography } from "@material-ui/core";
import { deliveryDay, deliveryTime, Schedule } from "../../consumer/consumerPlanModel";
import withClientApollo from '../utils/withClientApollo';
import DeleteIcon from '@material-ui/icons/Delete';
import { MIN_MEALS } from '../../plan/planModel';
import DeliveryDateChooser from './DeliveryDateChooser';
import { deliveryFee } from "../../order/costModel";

const useStyles = makeStyles(theme => ({
  deliveryHeader: {
    display: 'flex',
    paddingBottom: theme.spacing(2),
    alignItems: 'center',
  },
  paddingLeft: {
    paddingLeft: theme.spacing(2),
  },
  addButton: {
    marginTop: theme.spacing(1),
  },
  orange: {
    color: theme.palette.warning.dark,
  },
}));

const PreferredSchedule: React.FC<{
  addSchedule: () => void
  allowedDeliveries: number
  limit?: number
  schedules: Schedule[]
  start?: number
  removeSchedule: (i: number) => void
  updateSchedule: (i: number, day: deliveryDay, time: deliveryTime,) => void
}> = ({
  addSchedule,
  allowedDeliveries,
  limit,
  removeSchedule,
  schedules,
  updateSchedule,
}) => {
  const classes = useStyles();
  const remainingDeliveries = allowedDeliveries - schedules.length;
  let extraDeliveries;
  if (remainingDeliveries === 0) {
    if (allowedDeliveries > 1) {
      extraDeliveries = (
        <Typography variant='body1'>
          *Max deliveries reached
        </Typography>
      );
    }
  } else if (remainingDeliveries < 0) {
    extraDeliveries = (
      <Typography variant='body1' className={classes.orange}>
        *Too many deliveries. Please remove {Math.abs(remainingDeliveries)}
      </Typography>
    );
  } else {
    extraDeliveries = (
      <>
        <Typography variant='body1' color='textSecondary'>
          * {remainingDeliveries} extra {remainingDeliveries > 1 ? 'deliveries' : 'delivery'} available (+${(deliveryFee / 100).toFixed(2)} ea)
        </Typography>
        <Typography variant='body1' color='textSecondary'>
          (Separate deliveries available for every batch of {MIN_MEALS}+ meals)
        </Typography>
        <Button
          variant='outlined'
          color='primary'
          fullWidth
          onClick={addSchedule}
          className={classes.addButton}
        >
          Add a delivery
        </Button>
      </>
    )
  }
  
  return (
    <>
      {schedules.map((s, i) => (
        <div key={i}>
          <div className={classes.deliveryHeader}>
            {i > 0 && <DeleteIcon onClick={() => removeSchedule(i)} />}
            <Typography variant='h6' className={classes.paddingLeft}>
              Delivery {i + 1}
            </Typography>
            {
              i === 0 ?
                <Typography
                  variant='h6'
                  color='primary'
                  className={classes.paddingLeft}
                >
                  (Free)
                </Typography>
              :
                <Typography
                  variant='h6'
                  color='primary'
                  className={classes.paddingLeft}
                >
                  (+${(deliveryFee / 100).toFixed(2)})
                </Typography>
            }
          </div>
          <DeliveryDateChooser
            day={s.Day}
            onDayChange={day => updateSchedule(i, day, s.Time)}
            time={s.Time}
            onTimeChange={time => updateSchedule(i, s.Day, time)}
            limit={limit}
          />
        </div>
      ))}
      {extraDeliveries}
    </>
  );
}

export default withClientApollo(PreferredSchedule);