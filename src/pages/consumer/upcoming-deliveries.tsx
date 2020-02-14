import { makeStyles, Typography, Container, Paper, Divider } from "@material-ui/core";
import { useRouter } from "next/router";
// import { useGetCart } from "../../client/global/state/cartState";
// import { useGetRest } from "../../rest/restService";
// import { getNextDeliveryDate } from "../../order/utils";
import withClientApollo from "../../client/utils/withClientApollo";
import Close from '@material-ui/icons/Close';
import { useState } from "react";

const useStyles = makeStyles(theme => ({
  container: {
    background: 'none'
  },
  confirmation: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
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
    <Paper className={classes.confirmation}>
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
      <Typography variant='h3'>
        Upcoming deliveries
      </Typography>
    </Container>
  );
}

export default withClientApollo(UpcomingDeliveries);

export const upcomingDeliveriesRoute = '/consumer/upcoming-deliveries';