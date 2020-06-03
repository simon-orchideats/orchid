import { makeStyles, Typography, Container } from "@material-ui/core";
import { useGetAllUpcomingOrders } from "../../client/order/orderService";
import withApollo from "../../client/utils/withPageApollo";
import { useRequireConsumer } from "../../consumer/consumerService";
import ScheduleDeliveries from "../../client/general/inputs/ScheduledDelivieries";
import OrderOverview from "../../client/consumer/OrderOverview";

const useStyles = makeStyles(theme => ({
  container: {
    background: 'none'
  },
  marginBottom: {
    marginBottom: theme.spacing(3),
  },
}));

const UpcomingDeliveries = () => {
  const classes = useStyles();
  const orders = useGetAllUpcomingOrders();
  const consumer = useRequireConsumer(allUpcomingDeliveriesRoute);
  const consumerData = consumer.data;
  let OrderOverviews;
  if (orders.loading) {
    OrderOverviews = <Typography variant='body1'>Loading...</Typography>
  } else if (orders.data && orders.data.length === 0) {
    OrderOverviews = <Typography variant='subtitle1'>No upcoming deliveries.</Typography>
  } else {
    OrderOverviews = consumerData && orders.data && orders.data.map(order =>
      <OrderOverview
        key={order.Id}
        order={order}
        action={null}
        scheduleDeliveries={
          <ScheduleDeliveries
            deliveries={order.Deliveries}
          />
        }
      />
    )
  }
  if (!consumerData && !consumer.loading && !consumer.error) {
    return <Typography>Logging you in...</Typography>
  }
  if (!consumerData) {
    if (consumer.loading) return <Typography>Loading...</Typography>
    console.error('No consumer data', consumer.error);
    return <Typography>Error</Typography>
  }
  return (
    <Container maxWidth='xl' className={classes.container}>
      <Typography variant='h3' className={classes.marginBottom}>
        All Upcoming deliveries
      </Typography>
      {OrderOverviews}
    </Container>
  );
}

export default withApollo(UpcomingDeliveries);

export const allUpcomingDeliveriesRoute = '/consumer/all-upcoming-deliveries';