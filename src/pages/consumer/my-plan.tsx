import { makeStyles, Typography, Container, Paper, Button, Grid } from "@material-ui/core";
import { useRequireConsumer, useCancelSubscription, useUpdateMyPlan, useAddAccountToPlan, useGetSharedAccounts, useGetConsumer, useRemoveAccountFromPlan } from "../../consumer/consumerService";
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
import { IPlan, Plan } from "../../plan/planModel";
import withClientApollo from "../../client/utils/withClientApollo";
import DeleteIcon from '@material-ui/icons/Delete';
import { createRef, useState } from "react";

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
    background: 'none',
    paddingBottom: theme.spacing(4),
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
  addCol: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  addButton: {
    height: '100%'
  }
}));

const ShareList = withClientApollo(() => {
  const classes = useStyles();
  const [onAdd, onAddRes] = useAddAccountToPlan();
  const [onRemove, onRemoveRes] = useRemoveAccountFromPlan();
  const consumer = useGetConsumer();
  const notify = useNotify();
  useMutationResponseHandler(onAddRes, () => {
    if (onAddRes.error) {
      notify(onAddRes.error.message, NotificationType.success, false);
    }
  });
  useMutationResponseHandler(onRemoveRes, () => {
    if (onAddRes.error) {
      notify(onAddRes.error.message, NotificationType.success, false);
    }
  });
  const sharedAccounts = useGetSharedAccounts();
  const inputRef = createRef<HTMLInputElement>();
  const [inputError, setInputError] = useState('');
  const onClickAdd = () => {
    if (validate()) {
      onAdd(inputRef.current!.value)
    }
  }
  const validate = () => {
    if (!inputRef!.current!.value) {
      setInputError("Email can't be empty");
      return false;
    }
    return true;
  }
  return (
    <>
      <Typography
        variant='h4'
        color='primary'
        className={classes.verticalPadding}
      >
        Accounts on this plan
      </Typography>
      <Grid container>
        <Grid
          item
          xs={8}
          md={6}
        >
          <BaseInput
            label='New email'
            size='medium'
            error={!!inputError}
            helperText={inputError}
            inputRef={inputRef}
            onChange={_e => {
              if (inputError) setInputError('');
            }}
          />
        </Grid>
        <Grid item md={2}/>
        <Grid
          className={classes.addCol}
          item
          xs={4}
          md={4}
        >
          <Button
            className={classes.addButton}
            variant='outlined'
            size='medium'
            onClick={onClickAdd}
          >
            Add account
          </Button>
        </Grid>
      </Grid>
      {
        sharedAccounts.data.map(e => 
          <div className={`${classes.shareRow} ${classes.verticalPadding}`} key={e}>
            <Typography variant='subtitle1'>
              {e} {e === consumer.data?.profile.email && '(owner)'}
            </Typography>
            {
              e !== consumer.data?.profile.email &&
              <DeleteIcon onClick={() => onRemove(e)} />
            }
          </div>
        )
      }
    </>
  )
})

const myPlan = () => {
  const classes = useStyles();
  const consumer = useRequireConsumer(myPlanRoute, 'network-only');
  const plan = consumer.data && consumer.data.plan;
  const [updateMyPlan, updateMyPlanRes] = useUpdateMyPlan();
  const plans = useGetAvailablePlans();
  const [cancelSubscription, cancelSubscriptionRes] = useCancelSubscription();
  const currDbPlan = (plan && plans.data) ? Plan.getPlan(plan.stripeProductPriceId, plans.data) : null;
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
    if (!currDbPlan) {
      const err = new Error('Consumer missing plan');
      console.error(err.stack);
      throw err;
    }
    if (!consumer.data) {
      const err = new Error('Missing consumer');
      console.error(err.stack);
      throw err;
    }
    if (p.stripeProductPriceId === plan?.stripeProductPriceId) return;
    if ((plan && plan.role === PlanRoles.Owner) && currDbPlan.numAccounts > p.numAccounts) {
      notify(`Too many accounts for ${p.name} plan. Please remove ${currDbPlan.numAccounts - p.numAccounts} accounts`, NotificationType.error, false);
    }
    updateMyPlan(p.stripeProductPriceId, consumer.data);
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
            {
              plan.role === PlanRoles.Owner
              && currDbPlan
              && currDbPlan.numAccounts > 1
              && <ShareList />
            }
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
                  Current {plan.role === PlanRoles.Owner ? 'plan' : 'member'}
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
            <Typography variant='body2' align='center'>
              Immediately update your plan. You will be prorated upgrades and and receive credit for downgrades.
            </Typography>
            <Button
              variant='outlined'
              className={classes.cancel}
              onClick={onCancelSubscription}
            >
              Cancel subscription
            </Button>
            <Typography variant='body2'>
              Immediately cancel your subscription and all connected accounts
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