import { makeStyles, Typography, Container } from "@material-ui/core";
import { Order } from "../../order/orderModel";
import withApollo from "../../client/utils/withPageApollo"
import { useRequireConsumer } from "../../consumer/consumerService";
import ScheduleDeliveries from "../../client/general/inputs/ScheduledDelivieries";
import { Consumer } from "../../consumer/consumerModel";
import OrderOverview from "../../client/consumer/OrderOverview";
import { useGetPaidOrders } from "../../client/order/orderService";

const useStyles = makeStyles(theme => ({
  container: {
    background: 'none'
  },
  marginBottom: {
    marginBottom: theme.spacing(3),
  },
}));

const HistoryDeliveryOverview: React.FC<{
  consumer: Consumer,
  order: Order,
}> = ({
  consumer,
  order,
}) => {
  // todowhen you click feedback, it automatically replaces the schedule with a list of meals.
  // for each meal, show when it was delivered (day of week only and time) and if it was 2 deliveries,
  // then just label it as both
  // but then under hte meal there is an input box for feedback
  // then at the bottom there is a general feedback
  // then beneath, send feedback button
  // replace "leave feedback" with cancel
  return (
    <OrderOverview
      consumer={consumer}
      order={order}
      action={null}
      // action={
      //   <Button
      //     variant='contained'
      //     color='primary'
      //     onClick={() => Router.push({
      //       pathname: feedbackRoute,
      //       query: {
      //         orderId: order.Id
      //       },
      //     })}
      //   >
      //     Leave feedback
      //   </Button>
      // }
      scheduleDeliveries={<ScheduleDeliveries deliveries={order.Deliveries} />}
    />
  )
}

const OrderHistory = () => {
  const classes = useStyles();
  const orders = useGetPaidOrders();
  const consumer = useRequireConsumer(orderHistoryRoute);
  const consumerData = consumer.data;
  let OrderOverviews;
  if (orders.loading) {
    OrderOverviews = <Typography variant='body1'>Loading...</Typography>
  } else if (orders.data && orders.data.length === 0) {
    OrderOverviews = <Typography variant='subtitle1'>No order history.</Typography>
  } else {
    OrderOverviews = consumerData && orders.data && orders.data.map(order => 
      <HistoryDeliveryOverview
        key={order.Id}
        order={order}
        consumer={consumerData}
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
        Order history
      </Typography>
      {OrderOverviews}
    </Container>
  );
}

export default withApollo(OrderHistory);

export const orderHistoryRoute = '/consumer/order-history';