import { makeStyles, Typography, Container, Paper, Button} from "@material-ui/core";
import { useRef, useState } from 'react';
import { ConsumerPlan, deliveryDay, deliveryTime, Schedule, MealPlan } from '../../consumer/consumerPlanModel';
import RenewalChooser from '../../client/general/RenewalChooser';
import { useRequireConsumer, useCancelSubscription, useUpdateMyPlan } from "../../consumer/consumerService";
import withApollo from "../../client/utils/withPageApollo";
import { useMutationResponseHandler } from "../../utils/apolloUtils";
import Notifier from "../../client/notification/Notifier";
import { useNotify } from "../../client/global/state/notificationState";
import { NotificationType } from "../../client/notification/notificationModel";
import { sendChooseCuisineMetrics, sendUpdateScheduleMetrics, sendAddScheduleMetrics, sendRemoveScheduleMetrics, sendUpdatePlanMetrics, sendCancelSubscriptionMetrics } from "../../client/consumer/myPlanMetrics";
import Counter from "../../client/menu/Counter";
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import PreferredSchedule from "../../client/general/PreferredSchedule";
import { MIN_MEALS, Tier, PlanNames } from "../../plan/planModel";
import { menuRoute } from "../menu";
import Link from "next/link";
import { debounce } from 'lodash';
import { useGetAvailablePlans } from "../../plan/planService";
import { useGetTags } from "../../rest/restService";
import { Tag } from "../../rest/tagModel";

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
    maxWidth: 225,
    display: 'flex',
    alignItems: 'center',
  },
  price: {
    paddingLeft: theme.spacing(2),
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
  const tags = plan ? plan.Tags : [];
  const [updateMyPlan, updateMyPlanRes] = useUpdateMyPlan();
  const plans = useGetAvailablePlans();
  const validateCuisineRef= useRef<() => boolean>();
  const allTags = useGetTags();
  const [cancelSubscription, cancelSubscriptionRes] = useCancelSubscription();
  const notify = useNotify();
  // useRef because we want a store this delayedFetch between renders, otherwise we always redefine the delayedFetch
  // which means useEffect calls a different function on each run which means we never actually delay anything.
  const debouncedSendChoosePlanMetrics = useRef(debounce(sendUpdatePlanMetrics, 4000));
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
    const oldTags = prevPlan.Tags;
    const newTags = consumer.data.Plan.Tags;
    const oldSchedule = prevPlan.Schedules;
    const newSchedule = consumer.data.Plan.Schedules;
    if (oldMealCount !== newMealCount) {
      msg = `. We will pick ${newMealCount} meals for you in the future.`
    } else if (!Tag.areTagsEqual(oldTags, newTags)) {
      msg = `. We will pick new cuisines for you in the future.`;
    } else if (!Schedule.equalsLists(oldSchedule, newSchedule)) {
      msg = '. We will follow your new schedule in the future.'
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
    if (!plans.data) {
      const err = new Error('Missing plans');
      console.error(err.stack);
      throw err;
    }
    const plan = consumer.data.Plan;
    const mealCount = count - 1;
    const newAllowedDeliveries = Math.floor(mealCount / MIN_MEALS);
    if (newAllowedDeliveries < plan.Schedules.length) {
      notify(`Too many deliveries for ${mealCount} meals. Remove 1 first`, NotificationType.error, false);
      return;
    }
    if (mealCount < MIN_MEALS) return;
    setPrevPlan(plan);
    const newMealPlans = [
      new MealPlan({
        ...plan.MealPlans[0],
        mealCount,
      })
    ];
    debouncedSendChoosePlanMetrics.current(
      newMealPlans,
      plan.MealPlans,
      plans.data,
    )
    updateMyPlan(
      new ConsumerPlan({
        ...plan,
        mealPlans: newMealPlans
      }),
      consumer.data
    );
  }
  const onAddMeal = () => {
    if (!consumer.data || !consumer.data.Plan) throw noConsumerPlanErr();
    if (!plans.data) {
      const err = new Error('Missing plans');
      console.error(err.stack);
      throw err;
    }
    const plan = consumer.data.Plan;
    const newMealPlans = [
      new MealPlan({
        ...plan.MealPlans[0],
        mealCount: count + 1,
      })
    ];
    setPrevPlan(plan);
    debouncedSendChoosePlanMetrics.current(
      newMealPlans,
      plan.MealPlans,
      plans.data,
    );
    updateMyPlan(
      new ConsumerPlan({
        ...plan,
        mealPlans: newMealPlans
      }),
      consumer.data
    );
  }

  const addSchedule = () => {
    if (!consumer.data || !consumer.data.Plan) throw noConsumerPlanErr();
    const plan = consumer.data.Plan;
    setPrevPlan(plan);
    const schedules = plan.Schedules.map(s => new Schedule(s));
    const newSchedule = Schedule.getDefaultSchedule();
    schedules.push(newSchedule);
    sendAddScheduleMetrics(newSchedule, schedules.length);
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
    const removedSchedules = schedules.splice(i, 1);
    sendRemoveScheduleMetrics(removedSchedules[0], schedules.length);
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
    sendUpdateScheduleMetrics(newSchedule);
    updateMyPlan(
      new ConsumerPlan({
        ...plan,
        schedules,
      }),
      consumer.data
    );
  }
  const updateTags = (tags: Tag[]) => {
    if (!consumer.data || !consumer.data.Plan) throw noConsumerPlanErr();
    setPrevPlan(consumer.data.Plan);
    sendChooseCuisineMetrics(
      Tag.getCuisines(tags),
      Tag.getCuisines(consumer.data.Plan.Tags),
    );
    updateMyPlan(
      new ConsumerPlan({
        ...consumer.data.Plan,
        tags,
      }),
      consumer.data
    );
  };
  const onCancelSubscription = () => {
    if (!consumer.data || !consumer.data.Plan) throw noConsumerPlanErr();
    if (!plans.data) {
      const err = new Error('Missing plans');
      console.error(err.stack);
      throw err;
    }
    sendCancelSubscriptionMetrics(consumer.data.Plan.MealPlans, plans.data);
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
              <Typography
                variant='body1'
                color='textSecondary'
                className={classes.price}
              >
                {plans.data && `($${(Tier.getMealPrice(PlanNames.Standard, count, plans.data) / 100).toFixed(2)} ea)`}
              </Typography>
            </div>
            {
              count === MIN_MEALS &&
              <Typography variant='body1'>
               * Must have at least 4 meals
              </Typography>
            }
            <Typography
              variant='h4'
              color='primary'
              className={classes.verticalPadding}
            >
              Preferred repeat delivery days
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
              allTags={allTags.data || []}
              tags={tags}
              onTagChange={tags => updateTags(tags)}
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