import { makeStyles, Typography, Container, Paper, Button} from "@material-ui/core";
import { useRef, useState } from 'react';
import { CuisineType, ConsumerPlan, deliveryDay, deliveryTime, Schedule, MealPlan } from '../../consumer/consumerModel';
import RenewalChooser from '../../client/general/RenewalChooser';
import { useRequireConsumer, useCancelSubscription, useUpdateMyPlan } from "../../consumer/consumerService";
import withApollo from "../../client/utils/withPageApollo";
import { useMutationResponseHandler } from "../../utils/apolloUtils";
import Notifier from "../../client/notification/Notifier";
import { useNotify } from "../../client/global/state/notificationState";
import { NotificationType } from "../../client/notification/notificationModel";
import { sendChooseCuisineMetrics } from "../../client/consumer/myPlanMetrics";
import Counter from "../../client/menu/Counter";
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import PreferredSchedule from "../../client/general/PreferredSchedule";
import { MIN_MEALS } from "../../plan/planModel";
import { menuRoute } from "../menu";
import Link from "next/link";

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
    background: 'none',
    paddingBottom: theme.spacing(4),
  },
  button: {
    borderRadius: 10,
  },
  row: {
    maxWidth: 200,
    display: 'flex',
  },
  minusButton: {
    backgroundColor: `${theme.palette.grey[600]}`,
    '&:hover': {
      backgroundColor: theme.palette.grey[800],
    },
    '&:disabled': {
      backgroundColor: theme.palette.grey[300],
    },
  },
  paperContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
    marginTop: theme.spacing(3),
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
  verticalPadding: {
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(2),
  },
  cancel: {
    marginTop: theme.spacing(3),
  },
  subtitle: {
    marginTop: -theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}));

const myPlan = () => {
  const classes = useStyles();
  const consumer = useRequireConsumer(myPlanRoute);
  const plan = consumer.data && consumer.data.Plan;
  const [prevPlan, setPrevPlan] = useState<ConsumerPlan | null>(null);
  const cuisines = plan ? plan.Cuisines : [];
  const [updateMyPlan, updateMyPlanRes] = useUpdateMyPlan();
  const validateCuisineRef= useRef<() => boolean>();
  const [cancelSubscription, cancelSubscriptionRes] = useCancelSubscription();
  const notify = useNotify();
  useMutationResponseHandler(cancelSubscriptionRes, () => {
    notify('Plan canceled.', NotificationType.success, false);
  });
  useMutationResponseHandler(updateMyPlanRes, () => {
    if (!consumer.data || !consumer.data.Plan) throw noConsumerPlanErr();
    if (!prevPlan) {
      const err = new Error('No prev plan');
      console.error(err.stack);
      throw err;
    }
    let msg = '.';
    const oldMealCount = MealPlan.getTotalCount(prevPlan.mealPlans);
    const newMealCount = MealPlan.getTotalCount(consumer.data.Plan.MealPlans);
    const oldCuisines = prevPlan.Cuisines;
    const newCuisines = consumer.data.Plan.Cuisines;
    const oldSchedule = prevPlan.Schedules;
    const newSchedule = consumer.data.Plan.Schedules;
    if (oldMealCount !== newMealCount) {
      msg = `. We will pick ${newMealCount} meals for you in the future.`
    } else if (!ConsumerPlan.areCuisinesEqual(oldCuisines, newCuisines)) {
      msg = `. We will pick new cuisines for you in the future.`;
    } else if (!Schedule.equalsLists(oldSchedule, newSchedule)) {
      msg = '. We rescheduled your upcoming deliveries.'
    }
    notify(`Plan updated${msg}`, NotificationType.success, false);
  });
  if (!consumer.data && !consumer.loading && !consumer.error) {
    return <Typography>Logging you in...</Typography>
  }
  if (consumer.error) {
    console.error(`Error getting consumer in my-plan: ${consumer.error}`);
    return null;
  }
  const noConsumerPlanErr = () => {
    const err = new Error(`No consumer plan '${JSON.stringify(consumer.data)}' for update plan`);
    console.error(err.stack);
    return err;
  }
  if (!consumer.data) {
    if (consumer.loading) return <Typography variant='body1'>Loading...</Typography>;
    const err = new Error('No consumer data');
    console.error(err.stack);
    return null;
  }

  const count = plan ? plan.MealPlans[0].MealCount : 0;
  const allowedDeliveries = Math.floor(count / MIN_MEALS);

  const onRemoveMeal = () => {
    if (!consumer.data || !consumer.data.Plan) throw noConsumerPlanErr();
    const plan = consumer.data.Plan;
    const mealCount = count - 1;
    const newAllowedDeliveries = Math.floor(mealCount / MIN_MEALS);
    if (newAllowedDeliveries < plan.Schedules.length) {
      notify(`Too many deliveries for ${mealCount} meals. Remove 1 first`, NotificationType.error, false);
      return;
    }
    if (mealCount < MIN_MEALS) return;
    setPrevPlan(plan);
    updateMyPlan(
      new ConsumerPlan({
        ...plan,
        mealPlans: [
          new MealPlan({
            ...plan.MealPlans[0],
            mealCount,
          })
        ]
      }),
      consumer.data
    );
  }
  const onAddMeal = () => {
    if (!consumer.data || !consumer.data.Plan) throw noConsumerPlanErr();
    const plan = consumer.data.Plan;
    setPrevPlan(plan);
    updateMyPlan(
      new ConsumerPlan({
        ...plan,
        mealPlans: [
          new MealPlan({
            ...plan.MealPlans[0],
            mealCount: count + 1,
          })
        ]
      }),
      consumer.data
    );
  }
  const addSchedule = () => {
    if (!consumer.data || !consumer.data.Plan) throw noConsumerPlanErr();
    const plan = consumer.data.Plan;
    setPrevPlan(plan);
    const schedules = plan.Schedules.map(s => new Schedule(s));
    schedules.push(Schedule.getDefaultSchedule());
    updateMyPlan(
      new ConsumerPlan({
        ...plan,
        schedules,
      }),
      consumer.data
    );
  };
  const removeSchedule = (i: number) => {
    if (!consumer.data || !consumer.data.Plan) throw noConsumerPlanErr();
    const plan = consumer.data.Plan;
    setPrevPlan(plan);
    const schedules = plan.Schedules.map(s => new Schedule(s));
    schedules.splice(i, 1);
    updateMyPlan(
      new ConsumerPlan({
        ...plan,
        schedules,
      }),
      consumer.data
    );
  }
  const updateSchedule = (i: number, day: deliveryDay, time: deliveryTime) => {
    if (!consumer.data || !consumer.data.Plan) throw noConsumerPlanErr();
    const plan = consumer.data.Plan;
    setPrevPlan(plan);
    const newSchedule = new Schedule({ day, time });
    const schedules = plan.Schedules.map(s => new Schedule(s));
    schedules[i] = newSchedule;
    updateMyPlan(
      new ConsumerPlan({
        ...plan,
        schedules,
      }),
      consumer.data
    );
  }
  const updateCuisines = (cuisines: CuisineType[]) => {
    if (!consumer.data || !consumer.data.Plan) throw noConsumerPlanErr();
    setPrevPlan(consumer.data.Plan);
    sendChooseCuisineMetrics(cuisines, consumer.data.Plan.Cuisines);
    updateMyPlan(
      new ConsumerPlan({
        ...consumer.data.Plan,
        cuisines,
      }),
      consumer.data
    );
  };
  const onCancelSubscription = () => {
    // sendCancelSubscriptionMetrics(
    //   Plan.getMealPrice(consumer.data.Plan.StripePlanId, plans.data),
    //   Plan.getPlanCount(consumer.data.Plan.StripePlanId, plans.data),
    // );
    cancelSubscription();
  }
  return (
    <Container maxWidth='lg' className={classes.container}>
      <Notifier />
      <Typography variant='h3'>
        My plan
      </Typography>
      <Paper className={classes.paperContainer}>
      {
        plan ? 
          <>
            <Typography
              variant='h4'
              color='primary'
              className={classes.verticalPadding}
            >
              Meals enjoyed per week
            </Typography>
            <Typography variant='subtitle2' className={classes.subtitle}>
              Upcoming deliveries will automatically update their meals
            </Typography>
            <div className={classes.row}>
              <Counter
                subtractDisabled={count === MIN_MEALS}
                onClickSubtract={onRemoveMeal}
                subtractButtonProps={{
                  variant: 'contained',
                  className: `${classes.button} ${classes.minusButton}`
                }}
                subractIcon={<RemoveIcon />}
                chipLabel={count}
                chipDisabled={!count}
                onClickAdd={onAddMeal}
                addIcon={<AddIcon />}
                addButtonProps={{
                  variant: 'contained',
                  color: 'primary',
                  className: classes.button
                }}
              />
            </div>
            {
              count === MIN_MEALS &&
              <Typography variant='body1' color='error'>
                Must have at least 4 meals
              </Typography>
            }
            <Typography
              variant='h4'
              color='primary'
              className={classes.verticalPadding}
            >
              Preferred repeat delivery days
            </Typography>
            <Typography variant='subtitle2' className={classes.subtitle}>
              Upcoming deliveries will automatically change dates
            </Typography>
            <Typography
              variant='subtitle2'
              color='textSecondary'
              className={classes.subtitle}
            >
              * If a restaurant is closed, we'll deliver the next day
            </Typography>
            <PreferredSchedule
              addSchedule={addSchedule}
              allowedDeliveries={allowedDeliveries}
              removeSchedule={removeSchedule}
              schedules={plan.Schedules}
              updateSchedule={updateSchedule}
            />
            <RenewalChooser
              cuisines={cuisines}
              onCuisineChange={cuisines => updateCuisines(cuisines)}
              validateCuisineRef={validateCuisine => {
                validateCuisineRef.current = validateCuisine;
              }}
            />
            <Button
              variant='outlined'
              className={classes.cancel}
              onClick={onCancelSubscription}
            >
              Cancel subscription
            </Button>
          </>
        :
        <>
          <Typography
            variant='h4'
            color='primary'
            className={classes.verticalPadding}
          >
            Checkout the menu to get started
          </Typography>
          <Link href={menuRoute}>
            <Button
              variant='contained'
              color='primary'
            >
              SEE MENU
            </Button>
          </Link>
        </>
      }
      </Paper>
    </Container>
  );
}

export default withApollo(myPlan); 

export const myPlanRoute = '/consumer/my-plan';