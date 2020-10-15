import { makeStyles, Container, Typography, Button } from '@material-ui/core';
import Footer from '../client/general/Footer';
import withApollo from '../client/utils/withPageApollo';
import PlanCards from '../client/plan/PlanCards';
import Router from 'next/router';
import { useSetPlan } from '../client/global/state/cartState';
import { IPlan } from '../plan/planModel';
import { menuRoute } from './menu';

const useStyles = makeStyles(theme => ({
  container: {
    paddingBottom: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.background.default,
  },
  shrinker: {
    [theme.breakpoints.down('sm')]: {
      fontSize: '2.75rem',
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '2.15rem',
    },
  },
  weeklyPlans: {
    paddingBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.85rem',
      fontWeight: 500,
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.50rem',
    },
  },
}))

const plans = () => {
  const classes = useStyles();
  const setStripeProductPriceId = useSetPlan();
  const onClickButton = (plan: IPlan) => {
    setStripeProductPriceId(plan);
    Router.push(menuRoute);
  }
  return (
    <>
      <Container maxWidth='lg' className={classes.container}>
        <Typography variant='h3' className={`${classes.shrinker} ${classes.weeklyPlans}`}>
          Subscribe & Save
        </Typography>
        <Typography variant='h4'>
          Cancel anytime
        </Typography>
        <PlanCards
          renderButton={p => 
            <Button
              onClick={() => onClickButton(p)}
              variant='contained'
              color='primary'
              size='large'
              fullWidth
            >
              GET STARTED
            </Button>
          }
        />
      </Container>
      <Footer />
    </>
  )
}

export default withApollo(plans);

export const plansRoute = '/plans';