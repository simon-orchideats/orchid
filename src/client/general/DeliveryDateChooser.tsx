import ToggleButton from '@material-ui/lab/ToggleButton';
import { makeStyles, FormControl, Select, MenuItem, Typography } from "@material-ui/core";
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { deliveryDay, deliveryTime, ConsumerPlan } from "../../consumer/consumerPlanModel";
import withClientApollo from '../utils/withClientApollo';
import { getNextDeliveryDate } from '../../order/utils';
import { useGetConsumer } from '../../consumer/consumerService';
import { useMemo, useEffect } from 'react';

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

  const disables = useMemo(() => Array.from(
    [ 0, 1, 2, 3, 4, 5, 6, ],
    (d: deliveryDay) => !!limit && getNextDeliveryDate(d).valueOf() >= limit
  ), [ limit ]);

  useEffect(() => {
    if (disables[day]) {
      const allowedDay = disables.findIndex(d => d === false);
      if (allowedDay === -1) {
        const err = new Error(`Failed to find allowed day with limit '${limit}'`)
        console.error(err.stack);
        throw err;
      }
      onDayChange(allowedDay as deliveryDay)
    }
  });

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
        <ToggleButton value={0} disabled={disables[0]}>
          Su
        </ToggleButton>
        <ToggleButton value={1} disabled={disables[1]}>
          M
        </ToggleButton>
        <ToggleButton value={2} disabled={disables[2]}>
          T
        </ToggleButton>
        <ToggleButton value={3} disabled={disables[3]}>
          W
        </ToggleButton>
        <ToggleButton value={4} disabled={disables[4]}>
          Th
        </ToggleButton>
        <ToggleButton value={5} disabled={disables[5]}>
          F
        </ToggleButton>
        <ToggleButton value={6} disabled={disables[6]}>
          Sa
        </ToggleButton>
      </ToggleButtonGroup>
        <Typography variant='body1'>
          <b>{(consumer.data && consumer.data.Plan) ? 'Delivery day' : 'First delivery day'}: {getNextDeliveryDate(day).format('M/D/YY')}</b>
        </Typography>
      <FormControl variant='filled' className={`${classes.input} ${classes.smallPaddingBottom}`}>
        <Select
          value={time}
          onChange={e => onTimeChange(e.target.value as deliveryTime)}
        >
          {/* <MenuItem value={'OnePToThreeP'}>{ConsumerPlan.getDeliveryTimeStr('OnePToThreeP')}</MenuItem> */}
          <MenuItem value={'FivePToSevenP'}>{ConsumerPlan.getDeliveryTimeStr('FivePToSevenP')}</MenuItem>
          <MenuItem value={'SixPToEightP'}>{ConsumerPlan.getDeliveryTimeStr('SixPToEightP')}</MenuItem>
          <MenuItem value={'SevenPToNineP'}>{ConsumerPlan.getDeliveryTimeStr('SevenPToNineP')}</MenuItem>
        </Select>
      </FormControl>
    </>
  );
}

export default withClientApollo(DeliveryDateChooser);