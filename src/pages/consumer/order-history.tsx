//@ts-nocheck

import { makeStyles, Typography, Container } from "@material-ui/core";
import { Order } from "../../order/orderModel";
import withApollo from "../../client/utils/withPageApollo"
import { useRequireConsumer } from "../../consumer/consumerService";
import ScheduleDeliveries from "../../client/general/inputs/ScheduledDelivieries";
import OrderOverview from "../../client/consumer/OrderOverview";
import { useGetMyPaidOrders } from "../../client/order/orderService";

const useStyles = makeStyles(theme => ({
  container: {
    background: 'none'
  },
  marginBottom: {
    marginBottom: theme.spacing(3),
  },
}));

const HistoryDeliveryOverview: React.FC<{
  order: Order,
}> = ({
  order,
}) => {
  return (
    <OrderOverview
      order={order}
      action={null}
      scheduleDeliveries={<ScheduleDeliveries deliveries={order.Deliveries} />}
    />
  )
}

const OrderHistory = () => {
  const classes = useStyles();
  const orders = useGetMyPaidOrders();
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