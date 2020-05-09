import ToggleButton from '@material-ui/lab/ToggleButton';
import { makeStyles, FormControl, Select, MenuItem, Typography } from "@material-ui/core";
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { deliveryDay, deliveryTime, ConsumerPlan } from "../../consumer/consumerModel";
import withClientApollo from '../utils/withClientApollo';
import { getNextDeliveryDate } from '../../order/utils';
import { useGetConsumer } from '../../consumer/consumerService';

const useStyles = makeStyles(theme => ({
  smallPaddingBottom: {
    paddingBottom: theme.spacing(2),
  },
  toggleButtonGroup: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  input: {
    alignSelf: 'stretch',
  },
}));

const DeliveryDateChooser: React.FC<{
  onDayChange: (d: deliveryDay) => void
  day: deliveryDay
  onTimeChange: (t: deliveryTime) => void
  time: deliveryTime
  limit?: number
}> = ({
  onDayChange,
  day,
  onTimeChange,
  time,
  limit,
}) => {
  const classes = useStyles();
  const consumer = useGetConsumer();
  return (
    <>
      <ToggleButtonGroup
        className={classes.toggleButtonGroup}
        exclusive
        value={day}
        onChange={(_, d: deliveryDay) => {
          // d === null when selecting same day
          if (d === null) return;
          onDayChange(d);
        }}
      >
        <ToggleButton value={0} disabled={!!limit && getNextDeliveryDate(0).valueOf() >= limit}>
          Su
        </ToggleButton>
        <ToggleButton value={1} disabled={!!limit && getNextDeliveryDate(1).valueOf() >= limit}>
          M
        </ToggleButton>
        <ToggleButton value={2} disabled={!!limit && getNextDeliveryDate(2).valueOf() >= limit}>
          T
        </ToggleButton>
        <ToggleButton value={3} disabled={!!limit && getNextDeliveryDate(3).valueOf() >= limit}>
          W
        </ToggleButton>
        <ToggleButton value={4} disabled={!!limit && getNextDeliveryDate(4).valueOf() >= limit}>
          Th
        </ToggleButton>
        <ToggleButton value={5} disabled={!!limit && getNextDeliveryDate(5).valueOf() >= limit}>
          F
        </ToggleButton>
        <ToggleButton value={6} disabled={!!limit && getNextDeliveryDate(6).valueOf() >= limit}>
          Sa
        </ToggleButton>
      </ToggleButtonGroup>
      {
        (!consumer.data || !consumer.data.Plan) &&
        <Typography variant='body1'>
          First delivery day: <b>{getNextDeliveryDate(day).format('M/D/YY')}</b>
        </Typography>
      }
      <FormControl variant='filled' className={`${classes.input} ${classes.smallPaddingBottom}`}>
        <Select
          value={time}
          onChange={e => onTimeChange(e.target.value as deliveryTime)}
        >
          {/* <MenuItem value={'OnePToThreeP'}>{ConsumerPlan.getDeliveryTimeStr('OnePToThreeP')}</MenuItem> */}
          <MenuItem value={'FourPToSixP'}>{ConsumerPlan.getDeliveryTimeStr('FourPToSixP')}</MenuItem>
          <MenuItem value={'SixPToEightP'}>{ConsumerPlan.getDeliveryTimeStr('SixPToEightP')}</MenuItem>
        </Select>
      </FormControl>
    </>
  );
}

export default withClientApollo(DeliveryDateChooser);