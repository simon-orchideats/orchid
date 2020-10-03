import { Card, CardContent, Typography, Divider, useTheme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { IPlan } from '../../plan/planModel';
import CheckIcon from '@material-ui/icons/Check';
// import { menuRoute } from '../../pages/menu';
// import Router from 'next/router';
// import { useSetPlan } from '../global/state/cartState';
import withClientApollo from '../utils/withClientApollo';

const useStyles = makeStyles(theme => ({
  card: ({ defaultColor, small }: { defaultColor: boolean, small: boolean }) => ({
    marginLeft: theme.spacing(small ? 0 : 3),
    marginRight: theme.spacing(small ? 1 : 3),
    marginTop: theme.spacing(small ? 0 : 1),
    marginBottom: theme.spacing(1),
    paddingLeft: theme.spacing(small ? 0 : 2),
    paddingRight: theme.spacing(small ? 0 : 2),
    width: small ? 230 : 300,
    borderStyle: 'solid',
    borderColor: defaultColor ? theme.palette.divider : theme.palette.common.pink,
  }),
  marginTop: {
    marginTop: theme.spacing(2),
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  button: {
    marginTop: 'auto',
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
  defaultColor?: boolean,
  small?: boolean,
  isSelected: boolean,
  renderButton?: (p: IPlan) => React.ReactNode,
  onClickCard?: (p: IPlan) => void
  hideTrial?: boolean,
}> = ({
  plan,
  defaultColor = false,
  small = false,
  isSelected = false,
  hideTrial = false,
  renderButton,
  onClickCard,
}) => {
  const classes = useStyles({ defaultColor, small });
  const theme = useTheme();
  return (
    <Card
      onClick={() => {
        if (onClickCard && !renderButton) onClickCard(plan)
      }}
      className={classes.card}
      style={{
        borderColor: isSelected ? theme.palette.secondary.main : undefined
      }}
    >
      <CardContent className={classes.content}>
        {
          !hideTrial &&
          <Typography variant='h6'>
            <b className={classes.free}>
              1 month free
            </b>
          </Typography>
        }
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
        {
          renderButton &&
          <div
            className={classes.button}
            onClick={() => {
              if (onClickCard) onClickCard(plan)
            }}>
            {renderButton(plan)}
          </div>
        }
      </CardContent>
    </Card>
  );
}

export default withClientApollo(PlanDetails)