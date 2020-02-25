import ToggleButton from '@material-ui/lab/ToggleButton';
import { makeStyles, Typography, FormControl, InputLabel, Select, MenuItem, Button } from "@material-ui/core";
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { useUpdateDeliveryDay } from "../../client/global/state/cartState";
import { deliveryDay } from "../../consumer/consumerModel";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { getNextDeliveryDate } from '../../order/utils';
import { checkoutRoute } from "../../pages/checkout";
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
  row: {
    display: 'flex',
  },
}));
interface DeliveryDateProps {
  autoSave:boolean
}
const DeliveryDate = (props:DeliveryDateProps) => {

  const classes = useStyles();
  const [day, setDay] = useState<deliveryDay>(0);
  const inputLabel = useRef<HTMLLabelElement>(null);
  const [labelWidth, setLabelWidth] = useState(0);
  const updateDeliveryDay = useUpdateDeliveryDay();
  useEffect(() => {
    setLabelWidth(inputLabel.current!.offsetWidth);
  }, []);
  return (
    <>
  <ToggleButtonGroup
            className={classes.toggleButtonGroup}
            exclusive
            value={day}
            onChange={(_, d: deliveryDay) => {
              // d === null when selecting same day
              if (d === null) return;
              setDay(d)
            }}
          >
            <ToggleButton value={0}>
              Sun
            </ToggleButton>
            <ToggleButton value={3}>
              Wed
            </ToggleButton>
            <ToggleButton value={5}>
              Fri
            </ToggleButton>
          </ToggleButtonGroup>
          <FormControl variant='filled' className={`${classes.input} ${classes.smallPaddingBottom}`}>
            <InputLabel ref={inputLabel}>
              Another day
            </InputLabel>
            <Select
              labelWidth={labelWidth}
              value={day === 0 || day === 3 || day === 5 ? '' : day}
              onChange={e => setDay(e.target.value as deliveryDay)}
            >
              <MenuItem value={1}>Mon</MenuItem>
              <MenuItem value={2}>Tue</MenuItem>
              <MenuItem value={4}>Thur</MenuItem>
              <MenuItem value={6}>Sat</MenuItem>
            </Select>
          </FormControl>
          <div className={`${classes.row} ${classes.smallPaddingBottom}`}>
            <Typography variant='subtitle1'>
              First delivery:&nbsp;
            </Typography>
            <Typography variant='subtitle1'>
              {getNextDeliveryDate(day).format('M/D/YY')}, 6pm - 9pm
            </Typography>
          </div>
          {!props.autoSave &&
          <Link href={checkoutRoute}>
            <Button
              variant='contained'
              color='primary'
              fullWidth
              onClick={() => updateDeliveryDay(day)}
            >
              Next
            </Button>
          </Link>
        }
          </>
  );
}

export default DeliveryDate;