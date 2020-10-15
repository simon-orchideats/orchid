import { Card, CardContent, Typography, useTheme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { IPlan } from '../../plan/planModel';
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
    borderColor: defaultColor ? theme.palette.divider : theme.palette.divider,
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
    paddingTop: theme.spacing(2),
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
    color: theme.palette.common.white,
    backgroundColor: theme.palette.common.green,
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
        borderColor: isSelected ? theme.palette.primary.main : undefined
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
          className={classes.marginTop}
        >
          {plan.name} (Monthly)
        </Typography>
        <Typography variant='h6'>
          ${(plan.price / plan.numAccounts / 100).toFixed(2)}/account
        </Typography>
        <Typography variant='h6'>
          {plan.numAccounts} account{plan.numAccounts > 1 ? 's' : ''}
        </Typography>
        {
          plan.numAccounts > 1 &&
          <Typography variant='caption'>
            (total of ${(plan.price / 100).toFixed(2)}/month)
          </Typography>
        }
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