import { makeStyles, Typography, Container, Paper, Button} from "@material-ui/core";
import { useRequireConsumer, useCancelSubscription, useUpdateMyPlan } from "../../consumer/consumerService";
import withApollo from "../../client/utils/withPageApollo";
import { useMutationResponseHandler } from "../../utils/apolloUtils";
import Notifier from "../../client/notification/Notifier";
import { useNotify } from "../../client/global/state/notificationState";
import { NotificationType } from "../../client/notification/notificationModel";
import { menuRoute } from "../menu";
import Link from "next/link";
import { useGetAvailablePlans } from "../../plan/planService";
import BaseInput from "../../client/general/inputs/BaseInput";
import { PlanRoles } from "../../consumer/consumerPlanModel";
import PlanCards from "../../client/plan/PlanCards";
import { IPlan } from "../../plan/planModel";

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
  shareRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
}));

const ShareList = () => {
  const classes = useStyles();
  return (
    <>
      <Typography
        variant='h4'
        color='primary'
        className={classes.verticalPadding}
      >
        Sharing with
      </Typography>
      <div className={classes.shareRow}>
        <BaseInput placeholder='New email' size='medium' />
        <Button variant='outlined'>
          Add account
        </Button>
      </div>
    </>
  )
}

const myPlan = () => {
  const classes = useStyles();
  const consumer = useRequireConsumer(myPlanRoute);
  const plan = consumer.data && consumer.data.plan;
  const [updateMyPlan, updateMyPlanRes] = useUpdateMyPlan();
  console.log(updateMyPlan)
  const plans = useGetAvailablePlans();
  const [cancelSubscription, cancelSubscriptionRes] = useCancelSubscription();
  const notify = useNotify();
  useMutationResponseHandler(cancelSubscriptionRes, () => {
    notify('Plan canceled.', NotificationType.success, false);
  });
  useMutationResponseHandler(updateMyPlanRes, () => {
    notify(`Plan updated.`, NotificationType.success, false);
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
  const onClickPlan = (p: IPlan) => {
    console.log(p)
  }
  const onCancelSubscription = () => {
    if (!consumer.data || !consumer.data.plan) throw noConsumerPlanErr();
    if (!plans.data) {
      const err = new Error('Missing plans');
      console.error(err.stack);
      throw err;
    }
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
            {plan.role === PlanRoles.Owner && <ShareList />}
            <Typography
              variant='h4'
              color='primary'
              className={classes.verticalPadding}
            >
              Your Plan
            </Typography>
            <PlanCards
              defaultColor
              hideTrial
              selected={plan.stripeProductPriceId}
              renderButton={p => plan.stripeProductPriceId === p.stripeProductPriceId ?
                <Typography variant='h6' align='center'>
                  Current plan
                </Typography>
                :
                <Button
                  onClick={() => onClickPlan(p)}
                  variant='contained'
                  color='primary'
                  size='large'
                  fullWidth
                >
                  SWITCH PLAN
                </Button>
              }
            />
            <Typography variant='body2'>
              By signing up, you acknowledge that you have read and agree to the Amazon Prime Terms and Conditions and authorize us to charge your default payment method (Visa ****-4500) or another available payment method on file after your 30-day free trial. Your Amazon Prime membership continues until cancelled. If you do not wish to continue for $12.99/month plus any applicable taxes, you may cancel anytime by visiting Your Account and adjusting your membership settings. For customers in Hawaii, Puerto Rico, and Alaska please visit the Amazon Prime Shipping Benefits page to check various shipping options.
            </Typography>
            <Button
              variant='outlined'
              className={classes.cancel}
              onClick={onCancelSubscription}
            >
              Cancel subscription
            </Button>
            <Typography variant='body2'>
              By signing up, you acknowledge that you have read and agree to the Amazon Prime Terms and Conditions and authorize us to charge your default payment method (Visa ****-4500) or another available payment method on file after your 30-day free trial. Your Amazon Prime membership continues until cancelled. If you do not wish to continue for $12.99/month plus any applicable taxes, you may cancel anytime by visiting Your Account and adjusting your membership settings. For customers in Hawaii, Puerto Rico, and Alaska please visit the Amazon Prime Shipping Benefits page to check various shipping options.
            </Typography>
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