import { Card, CardContent, Typography, Divider, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { IPlan } from '../../plan/planModel';
import CheckIcon from '@material-ui/icons/Check';
import { menuRoute } from '../../pages/menu';
import Router from 'next/router';
import { useSetStripeProductPriceId } from '../global/state/cartState';
import withClientApollo from '../utils/withClientApollo';

const useStyles = makeStyles(theme => ({
  card: ({ color, small }: { color: string, small: boolean }) => ({
    marginLeft: theme.spacing(small ? 0 : 3),
    marginRight: theme.spacing(small ? 1 : 3),
    marginTop: theme.spacing(small ? 0 : 1),
    marginBottom: theme.spacing(1),
    paddingLeft: theme.spacing(small ? 0 : 2),
    paddingRight: theme.spacing(small ? 0 : 2),
    width: small ? 230 : 300,
    borderStyle: 'solid',
    borderColor: color === 'black' ? theme.palette.primary.main : theme.palette.common.pink,
  }),
  marginTop: {
    marginTop: theme.spacing(2),
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  check: {
    verticalAlign: 'text-bottom'
  },
  free: {
    padding: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
    borderRadius: theme.spacing(1),
  },
}));

const PlanDetails: React.FC<{
  plan: IPlan;
  color?: string,
  small?: boolean,
}> = ({
  plan,
  color = 'default',
  small = false
}) => {
  const classes = useStyles({ color, small });
  const setStripeProductPriceId = useSetStripeProductPriceId();
  const onClick = (id: string) => {
    setStripeProductPriceId(id);
    Router.push(menuRoute);
  }
  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant='h6'>
          <b className={classes.free}>
            1 month free
          </b>
        </Typography>
        <Typography
          variant='h5'
          color='primary'
          className={classes.marginTop}
        >
          {plan.name} Plan
        </Typography>
        <Typography variant='h6'>
          ${(plan.price / 100).toFixed(2)}/month after trial
        </Typography>
        <Typography variant='h6'>
          {plan.numAccounts} account{plan.numAccounts > 1 ? 's' : ''}
        </Typography>
        <Divider className={classes.divider} />
        <Typography variant='h6'>
          <CheckIcon className={classes.check} />
          &nbsp;Lowest pricing guarantee
        </Typography>
        <Typography variant='h6'>
          <CheckIcon className={classes.check} />
          &nbsp;No service charge
        </Typography>
        <Button
          className={classes.marginTop}
          onClick={() => onClick(plan.stripeProductPriceId)}
          variant='contained'
          color='primary'
          size='large'
          fullWidth
        >
          GET STARTED
        </Button>
      </CardContent>
    </Card>
  );
}

export default withClientApollo(PlanDetails)