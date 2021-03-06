import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Typography, Popover } from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';
// import RestaurantMenuIcon from '@material-ui/icons/RestaurantMenu';
import { profileRoute } from '../../pages/consumer/profile';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
// import { myPlanRoute } from '../../pages/consumer/my-plan';
import Router from 'next/router'
import HistoryIcon from '@material-ui/icons/History';
import { orderHistoryRoute } from '../../pages/consumer/order-history';
import { allOrderHistoryRoute } from '../../pages/consumer/all-past-orders';
import ReceiptIcon from '@material-ui/icons/Receipt';
import { useGetConsumer } from '../../consumer/consumerService';
import { Permissions } from '../../consumer/consumerModel';
import withClientApollo from '../utils/withClientApollo';
import { addPartnerRoute } from '../../pages/consumer/add-partner';
import StorefrontIcon from '@material-ui/icons/Storefront';

const useStyles = makeStyles(theme => ({
  row: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  icon: {
    paddingRight: theme.spacing(1),
  },
  paper: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}));

const ConsumerPopper: React.FC<{
  open: boolean,
  onClose: () => void,
  anchorEl: Element | ((element: Element) => Element) | null | undefined
}> = ({
  open,
  onClose,
  anchorEl,
}) => {
  const consumerRes = useGetConsumer();
  const consumer = consumerRes.data;
  const classes = useStyles();
  return (
    <Popover
      open={open}
      onClose={onClose}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Paper className={classes.paper}>
        <div className={classes.row} onClick={() => {
          Router.push(profileRoute);
          onClose();
        }}>
          <PersonIcon fontSize='large' className={classes.icon} />
          <Typography variant='h6'>
            Profile
          </Typography>
        </div>
        {/* <div className={classes.row} onClick={() => {
          Router.push(myPlanRoute);
          onClose();
        }}>
          <RestaurantMenuIcon fontSize='large' className={classes.icon} />
          <Typography variant='h6'>
            My plan
          </Typography>
        </div> */}
        <div className={classes.row} onClick={() => {
          Router.push(orderHistoryRoute);
          onClose();
        }}>          
          <HistoryIcon fontSize='large' className={classes.icon} />
          <Typography variant='h6'>
            Order history
          </Typography>
        </div>
        {
          consumer && consumer.permissions.includes(Permissions.updateAllOrders) &&
          <>
            <div className={classes.row} onClick={() => {
              Router.push(allOrderHistoryRoute);
              onClose();
            }}>
              <ReceiptIcon fontSize='large' className={classes.icon} />
              <Typography variant='h6'>
                All past orders
              </Typography>
            </div>
          </>
        }
        {
          consumer && consumer.permissions.includes(Permissions.createRests) &&
          <div className={classes.row} onClick={() => {
            Router.push(addPartnerRoute);
            onClose();
          }}>
            <StorefrontIcon fontSize='large' className={classes.icon} />
            <Typography variant='h6'>
              Add a partner
            </Typography>
          </div>
        }
        <div className={classes.row} onClick={() => {
          window.location.assign('/api/logout');
          onClose();
        }}>
          <ExitToAppIcon fontSize='large' className={classes.icon} />
          <Typography variant='h6'>
            Log out
          </Typography>
        </div>
      </Paper>
    </Popover>
  );
}

export default withClientApollo(ConsumerPopper);
