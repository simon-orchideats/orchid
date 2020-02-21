
import { Card, CardContent, makeStyles, Typography, Container, InputLabel, Select, MenuItem, FormControl, Grid, Button } from "@material-ui/core";
import requireAuth from "../../client/utils/auth/requireAuth";
import { useState, useRef, useEffect } from 'react';
import { deliveryDay } from '../../consumer/consumerModel';
import withClientApollo from "../../client/utils/withClientApollo";
import { useUpdateDeliveryDay } from '../../client/global/state/cartState';
import { useGetAvailablePlans } from '../../plan/planService';
import ToggleButton from '@material-ui/lab/ToggleButton';
import { getNextDeliveryDate } from '../../order/utils';
import { RenewalTypes, RenewalType, CuisineTypes, CuisineType } from "../../consumer/consumerModel";
// import { useNotify } from "../../client/global/state/notificationState";
import Notifier from "../../client/notification/Notifier";
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
  title: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
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
  subtitle: {
    marginTop: -theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  cardSelectedSubtitle: {
    color: theme.palette.grey['300'],
   
  },
  cardSubtitle: {
    color: theme.palette.text.secondary,
  }
}));
const PlanCards = () => {
  // use plan model
  interface MealPlan {
    stripeId: string;
    mealCount: number;
    mealPrice: number;
    weekPrice: number;
  }
  // const notify = useNotify();
  const classes = useStyles();
  const plans = useGetAvailablePlans();
  const [mealPlan, setMealPlan] = useState<MealPlan>();
  console.log(mealPlan);
  if (!plans.data) {
    return <div>loading</div>
  }
  return (
    <Grid container justify='center'>
      {plans.data.map(plan => (
        <Grid key={plan.StripeId}item sm={12} md={4} className={classes.item}>
          <Card onClick={() => {
              let mealPlan: MealPlan;
              mealPlan = {
                stripeId: plan.stripeId,
                mealCount: plan.mealCount,
                mealPrice: plan.mealPrice,
                weekPrice: plan.weekPrice,
              }
              setMealPlan(mealPlan);
            }} key={plan.MealPrice} className={ mealPlan?.mealPrice === plan.MealPrice ? classes.cardSelected : classes.card}>
              <CardContent>
                <Typography variant='h6'>
                  {plan.MealCount} meals/week
                </Typography>
                <Typography variant='body2' className={ mealPlan?.mealPrice === plan.MealPrice ? classes.cardSelectedSubtitle : classes.cardSubtitle}>
                  ${plan.MealPrice.toFixed(2)}/meal
                </Typography>
                <Typography variant='body2' className={ mealPlan?.mealPrice === plan.MealPrice ? classes.cardSelectedSubtitle : classes.cardSubtitle}>
                  ${plan.WeekPrice.toFixed(2)}/week
                </Typography>
              </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
// const validate = () => {
//   let isValid = true;
//   if (cuisines.length === 0 && renewal === RenewalTypes.Auto) {
//     setCuisinesError('Your picks are incomplete');
//     isValid = false;
//   }
//   return isValid;
// }
const myPlan = () => {

  const classes = useStyles();
  const [cuisines, setCuisines] = useState<CuisineType[]>([]);
  const [renewal, setRenewal] = useState<RenewalType>(RenewalTypes.Skip);
  const [cuisinesError, setCuisinesError] = useState<string>('');
  const [day, setDay] = useState<deliveryDay>(0);
  const inputLabel = useRef<HTMLLabelElement>(null);
  const [labelWidth, setLabelWidth] = useState(0);
  const updateDeliveryDay = useUpdateDeliveryDay();
  useEffect(() => {
    setLabelWidth(inputLabel.current!.offsetWidth);
  }, []);
  return (
    <Container maxWidth='xl' className={classes.container}>
       <Notifier />
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
        <Grid container>
            <Grid item xs={12}>
              <Typography
                variant='h6'
                color='primary'
                className={classes.title}
              >
                Upcoming Week
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant='subtitle2' className={classes.subtitle}>
                How do you want to handle meals for next week?
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <ToggleButtonGroup
                className={classes.toggleButtonGroup}
                size='small'
                exclusive
                value={renewal}
                onChange={(_, rt: RenewalType) => {
                  // rt === null when selecting button
                  if (rt === null) return;
                  setRenewal(rt)
                }}
              >
                <ToggleButton value={RenewalTypes.Auto}>
                  Pick for me
                </ToggleButton>
                <ToggleButton value={RenewalTypes.Skip}>
                  Skip them
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>
        {
            renewal === RenewalTypes.Auto &&
            <Grid container>
              <Grid item xs={12}>
                <Typography
                  variant='h6'
                  color='primary'
                  className={classes.title}
                >
                  What foods would you like in your meal plan?
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant='subtitle2' className={classes.subtitle}>
                  We only pick 1 restaurant per week
                </Typography>
                <Typography
                  component='p'
                  variant='caption'
                  color='error'
                  className={classes.subtitle}
                >
                  {cuisinesError}
                </Typography>
              </Grid>
             
              <Grid container spacing={2}>
                {Object.values<CuisineType>(CuisineTypes).map(cuisine => {
                  const withoutCuisine = cuisines.filter(c => cuisine !== c);
                  const isSelected = withoutCuisine.length !== cuisines.length;
                  return (
                    <Grid
                      key={cuisine}
                      item
                      xs={6}
                      sm={4}
                      lg={3}
                    >
                      <Button
                        fullWidth
                        color='primary'
                        variant={isSelected ? 'contained' : 'outlined'}
                        onClick={() => {
                          if (isSelected) {
                            setCuisines(withoutCuisine);
                            return;
                          }
                          setCuisines([...cuisines, cuisine]);
                          if (withoutCuisine.length === 0) setCuisinesError('')
                        }}
                      >
                        {cuisine}
                      </Button>
                    </Grid>
                  )
                })}
              </Grid>
            </Grid>
          }
    </Container>
  );
}

export default withClientApollo(requireAuth(myPlan)); 

export const myPlanRoute = '/consumer/my-plan';