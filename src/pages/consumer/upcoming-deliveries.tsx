import { makeStyles, Typography, Container, Paper, Divider } from "@material-ui/core";
import { useRouter } from "next/router";
// import { useGetCart } from "../../client/global/state/cartState";
// import { useGetRest } from "../../rest/restService";
// import { getNextDeliveryDate } from "../../order/utils";
import withClientApollo from "../../client/utils/withClientApollo";
import Close from '@material-ui/icons/Close';
import { useState } from "react";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles(theme => ({
  container: {
    background: 'none'
  },
  marginBottom: {
    marginBottom: theme.spacing(3),
  },
  confirmation: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
    borderColor: theme.palette.primary.main
  },
  overviewSection: {
    padding: theme.spacing(2),
  },
  divider: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  close: {
    cursor: 'pointer'
  },
  hint: {
    color: theme.palette.text.hint
  },
  link: {
    color: theme.palette.common.link
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
}));

const Confirmation: React.FC<{
  onClose: () => void
}> = ({
  onClose,
}) => {
  // const cart = useGetCart();
  // if (!cart) throw new Error('Cart is null');
  // const res = useGetRest(cart.RestId);
  // const groupedMeals = cart.getGroupedMeals();
  const classes = useStyles();
  return (
    <Paper variant='outlined' className={classes.confirmation}>
      <div className={classes.row}>
        <Typography variant='h6' color='primary'>
          Thank you, your delivery has been scheduled
        </Typography>
        <Close className={classes.close} onClick={onClose} />
      </div>
      <Typography variant='body1'>
        We sent you a confirmation email
      </Typography>
      <Typography variant='body1'>
        We'll text you the day of your delivery
      </Typography>
      <Typography variant='body1'>
        Deliver on 2/23/20, 6pm - 9pm
      </Typography>
      <Divider className={classes.divider} />
      <Typography variant='subtitle1'>
        Domo
      </Typography>
      <Typography variant='body1'>
        {4} {'Rice and chicken'}
      </Typography>
      <Typography variant='body1'>
        {4} {'Rice and chicken'}
      </Typography>
      <Typography variant='body1'>
        {4} {'Rice and chicken'}
      </Typography>
      <Typography variant='body1'>
        {4} {'Rice and chicken'}
      </Typography>
      {/*
      <Typography variant='body1'>
        Deliver on {getNextDeliveryDate(cart.DeliveryDay).format('M/D/YY')}, 6pm - 9pm
      </Typography>
      <Typography variant='subtitle1'>
        {res.data && res.data.Profile.Name}
      </Typography>
      {groupedMeals && groupedMeals.map(mealGroup => (
        <Typography variant='body1'>
          {mealGroup.quantity} {mealGroup.meal.Name}
        </Typography>
      ))} 
      */}
    </Paper>
  )
} 

const DeliveryOverview: React.FC = () => {
  const classes = useStyles();
  return (
    <Paper className={classes.marginBottom}>
      <div className={`${classes.row} ${classes.overviewSection}`}>
        <div className={classes.column}>
          <Typography variant='subtitle1'>
            Deliver on
          </Typography>
          <Typography variant='body1' className={classes.hint}>
            10/24/20
          </Typography>
        </div>
        <div className={classes.column}>
          <Typography variant='subtitle1'>
            Total
          </Typography>
          <Typography variant='body1' className={classes.hint}>
            4 meals ($8.99 ea)
          </Typography>
        </div>
        <div className={classes.column}>
          <Typography variant='subtitle1'>
            Deliver to
          </Typography>
          <div className={`${classes.row} ${classes.link}`}>
            <Typography variant='body1'>
              Simon
            </Typography>
            <ExpandMoreIcon />
          </div>
        </div>
      </div>
      <Divider />
      <div className={classes.overviewSection}>
        <Typography variant='subtitle1'>
          Domo
        </Typography>
        <Typography variant='body1'>
          {4} {'Rice and chicken'}
        </Typography>
        <Typography variant='body1'>
          {4} {'Rice and chicken'}
        </Typography>
        <Typography variant='body1'>
          {4} {'Rice and chicken'}
        </Typography>
        <Typography variant='body1'>
          {4} {'Rice and chicken'}
        </Typography>
        <Typography variant='body1'>
          {4} {'Rice and chicken'}
        </Typography>
        <Typography variant='body1'>
          {4} {'Rice and chicken'}
        </Typography>
        <Typography variant='body1'>
          {4} {'Rice and chicken'}
        </Typography>
        <Typography variant='body1'>
          {4} {'Rice and chicken'}
        </Typography>
      </div>
    </Paper>
  )
}

const UpcomingDeliveries = () => {
  const classes = useStyles();
  const needsConfirmation = useRouter().query.confirmation;
  const [showConfirmation, setShowConfirmation] = useState(true);
  return (
    <Container maxWidth='lg' className={classes.container}>
      {
        needsConfirmation 
        && needsConfirmation === 'true'
        && showConfirmation
        && <Confirmation onClose={() => setShowConfirmation(false)} />
      }
      <Typography variant='h3' className={classes.marginBottom}>
        Upcoming deliveries
      </Typography>
      <DeliveryOverview />
      <DeliveryOverview />
      <DeliveryOverview />
    </Container>
  );
}

export default withClientApollo(UpcomingDeliveries);

export const upcomingDeliveriesRoute = '/consumer/upcoming-deliveries';