
import { makeStyles, Typography, Container, Paper, Button} from "@material-ui/core";
import { useState, useRef } from 'react';
import { CuisineType, RenewalType,RenewalTypes, deliveryDay } from '../../consumer/consumerModel';
import PlanCards from '../../client/plan/PlanCards';
import RenewalChooser from '../../client/general/RenewalChooser';
import DeliveryDateChooser from '../../client/general/DeliveryDateChooser';
import { useRequireConsumer, useCancelSubscription } from "../../consumer/consumerService";
import withApollo from "../../client/utils/withPageApollo";
import { useMutationResponseHandler } from "../../utils/apolloUtils";
import Notifier from "../../client/notification/Notifier";
import Router from "next/router";
import { useUpdateCartPlanId } from "../../client/global/state/cartState";
import { Plan } from "../../plan/planModel";
import { menuRoute } from "../menu";
import { useNotify } from "../../client/global/state/notificationState";
import { NotificationType } from "../../client/notification/notificationModel";

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
}));

const myPlan = () => {
  const classes = useStyles();
  const consumer = useRequireConsumer(myPlanRoute);
  const plan = consumer.data && consumer.data.Plan;
  const [renewal, setRenewal] = useState<RenewalType>(plan ? plan.Renewal : RenewalTypes.Auto)
  const [cuisines, setCuisines] = useState<CuisineType[]>(plan ? plan.Cuisines : []);
  const [day, setDay] = useState<deliveryDay>(plan ? plan.DeliveryDay : 0);
  const validateCuisineRef= useRef<() => boolean>();
  const [cancelSubscription, cancelSubscriptionRes] = useCancelSubscription();
  const setCartStripePlanId = useUpdateCartPlanId();
  const notify = useNotify();
  useMutationResponseHandler(cancelSubscriptionRes, () => {
    notify('Plan updated', NotificationType.success, true);
  });
  const onClickCardNoSubscription = (plan: Plan) => {
    Router.push(menuRoute);
    setCartStripePlanId(plan.stripeId);
  };
  if (!consumer.data && !consumer.loading && !consumer.error) {
    return <Typography>Logging you in...</Typography>
  }
  if (consumer.error) {
    console.error(`Error getting consumer in my-plan: ${consumer.error}`);
    return null;
  }
  if (!consumer.data ) {
    if (consumer.loading) return <Typography variant='body1'>Loading...</Typography>;
    const err = new Error('No consumer plan');
    console.error(err.stack);
    return null;
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
              variant='h6'
              color='primary'
              className={classes.verticalPadding}
            >
              Preferred meal plan
            </Typography>
            <PlanCards isSelectable={true} defaultPlanId={plan.StripePlanId} />
            <Typography
              variant='h6'
              color='primary'
              className={classes.verticalPadding}
            >
              Preferred delivery day
            </Typography>
            <DeliveryDateChooser day={day} onDayChange={day => setDay(day)}/>
            <Typography
              variant='h6'
              color='primary'
              className={classes.verticalPadding}
            >
              Next Week
            </Typography>
            <RenewalChooser
              renewal={renewal}
              cuisines={cuisines}
              onCuisineChange={cuisines => setCuisines(cuisines)}
              onRenewalChange={renewal => setRenewal(renewal)}
              validateCuisineRef={validateCuisine => {
                validateCuisineRef.current = validateCuisine;
              }}
            />
            <Button
              variant='outlined'
              className={classes.cancel}
              onClick={cancelSubscription}
            >
              Cancel subscription
            </Button>
          </>
        :
        <>
          <Typography
            variant='h6'
            color='primary'
            className={classes.verticalPadding}
          >
            Choose a meal plan to get started
          </Typography>
          <PlanCards onClickCard={onClickCardNoSubscription} />
        </>
      }
      </Paper>
    </Container>
  );
}

export default withApollo(myPlan); 

export const myPlanRoute = '/consumer/my-plan';