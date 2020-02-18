
import { Card, CardContent,makeStyles, Typography, Container,
  InputLabel, Select, MenuItem, Button, FormControl, Grid } from "@material-ui/core";
import Link from "next/link";
import requireAuth from "../../client/utils/auth/requireAuth";
import { useState, useRef, useEffect } from 'react';
import { deliveryDay } from '../../consumer/consumerModel';
import withClientApollo from "../../client/utils/withClientApollo";
import { useUpdateDeliveryDay } from '../../client/global/state/cartState';
import { useGetAvailablePlans } from '../../plan/planService';
import ToggleButton from '@material-ui/lab/ToggleButton';
import { getNextDeliveryDate } from '../../order/utils';
import { checkoutRoute } from "../checkout";
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'none',
    paddingBottom: theme.spacing(4),
  },
  marginBottom: {
    marginBottom: theme.spacing(3),
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
  item: {
    display: 'flex',
    justifyContent: 'center',
  },
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
}));
const PlanCards = () => {
  const classes = useStyles();
  const plans = useGetAvailablePlans();
  if (!plans.data) {
    return <div>loading</div>
  }
  return (
    <Grid container justify='center'>
      {plans.data.map(plan => (
        <Grid key={plan.StripeId}item sm={12} md={4} className={classes.item}>
          <Card key={plan.MealPrice} className={classes.card}>
            <CardContent>
              <Typography variant='h6'>
                {plan.MealCount} meals/week
              </Typography>
              <Typography variant='body2' color='textSecondary'>
                ${plan.MealPrice.toFixed(2)}/meal
              </Typography>
              <Typography variant='body2' color='textSecondary'>
                ${plan.WeekPrice.toFixed(2)}/week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

const myPlan = () => {

  const classes = useStyles();
  const [day, setDay] = useState<deliveryDay>(0);
  const inputLabel = useRef<HTMLLabelElement>(null);
  const [labelWidth, setLabelWidth] = useState(0);
  const updateDeliveryDay = useUpdateDeliveryDay();
  useEffect(() => {
    setLabelWidth(inputLabel.current!.offsetWidth);
  }, []);
  return (
    <Container maxWidth='lg' className={classes.container}>
     <PlanCards/>
      <Typography
          variant='h3'
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
    </Container>
  );
}

export default withClientApollo(requireAuth(myPlan)); 

export const myPlanRoute = '/consumer/my-plan';