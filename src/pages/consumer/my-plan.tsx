
import { makeStyles, Typography, Container, InputLabel, Select, MenuItem, FormControl, Paper} from "@material-ui/core";
// import requireAuth from "../../client/utils/auth/requireAuth";
import { useState, useRef, useEffect } from 'react';
import { deliveryDay, CuisineType, RenewalType, RenewalTypes } from '../../consumer/consumerModel';
import withClientApollo from "../../client/utils/withClientApollo";
import { useUpdateDeliveryDay } from '../../client/global/state/cartState';
import ToggleButton from '@material-ui/lab/ToggleButton';
import { getNextDeliveryDate } from '../../order/utils';
import PlanCards from '../../client/plan/PlanCards';
// import { useNotify } from "../../client/global/state/notificationState";
import NextWeek from '../../client/general/NextWeek';
import Notifier from "../../client/notification/Notifier";
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
    background: 'none',
    paddingBottom: theme.spacing(4),
  },
  paperContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
    paddingBottom: theme.spacing(4),
    paddingTop: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
  toggleButtonGroup: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  input: {
    alignSelf: 'stretch',
  },
  smallPaddingBottom: {
    paddingBottom: theme.spacing(2),
  },
  row: {
    display: 'flex',
  },
  header: {
    paddingBottom: theme.spacing(4),
  },
}));

const myPlan = () => {

  const classes = useStyles();
  const [selectedRenewal, setSelectedRenewal] = useState<RenewalType>(RenewalTypes.Skip)
  const [selectedCuisines, setSelectedCuisines] = useState<CuisineType[]>([]);
  const [selectedcuisinesError, setSelectedCuisinesError] = useState<string>('');
  const [day, setDay] = useState<deliveryDay>(0);
  const inputLabel = useRef<HTMLLabelElement>(null);
  const [labelWidth, setLabelWidth] = useState(0);
  const updateDeliveryDay = useUpdateDeliveryDay();
  const cuisineProps = {selectedCuisines, setSelectedCuisines, selectedRenewal, setSelectedRenewal, selectedcuisinesError, setSelectedCuisinesError};
  const autoSave={autoSave:true};
  useEffect(() => {
    setLabelWidth(inputLabel.current!.offsetWidth);
  }, []);
  return (
    <Container maxWidth='xl' className={classes.container}>
       <Typography
          variant='h6'
          color='primary'
          className={classes.header}
        >
         My plan
        </Typography>
       <Notifier />
       <Paper className={classes.paperContainer}>
       <Typography
          variant='h6'
          color='primary'
          className={classes.header}
        >
         Preferred meal plan
        </Typography>
     <PlanCards isClickable={true}/>
      <Typography
          variant='h6'
          color='primary'
          className={classes.header}
        >
         Preferred delivery day
        </Typography>
       <ToggleButtonGroup
          className={classes.toggleButtonGroup}
          exclusive
          value={day}
          onChange={(_, d: deliveryDay) => {
            // d === null when selecting same day
            if (d === null) return;
            setDay(d)
            updateDeliveryDay(d)
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
            onChange={e => {setDay(e.target.value as deliveryDay); updateDeliveryDay(e.target.value as deliveryDay)}}
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
        <NextWeek {...{...cuisineProps,...autoSave}}/>
        </Paper>
    </Container>
  );
}

export default withClientApollo(myPlan); 

export const myPlanRoute = '/consumer/my-plan';