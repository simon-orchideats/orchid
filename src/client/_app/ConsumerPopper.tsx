import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Typography, Popover } from '@material-ui/core';
import EventIcon from '@material-ui/icons/Event';
import PersonIcon from '@material-ui/icons/Person';
import RestaurantMenuIcon from '@material-ui/icons/RestaurantMenu';
import Link from 'next/link';
import { profileRoute } from '../../pages/consumer/profile';
import { upcomingDeliveriesRoute } from '../../pages/consumer/upcoming-deliveries';

const useStyles = makeStyles(theme => ({
  row: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
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
        <Link href={profileRoute}>
          <div className={classes.row}>
            <PersonIcon fontSize='large' />
            <Typography variant='h6'>
              Profile
            </Typography>
          </div>
        </Link>
        <div className={classes.row}>
          <RestaurantMenuIcon fontSize='large' />
          <Typography variant='h6'>
            My plan
          </Typography>
        </div>
        <Link href={upcomingDeliveriesRoute}>
          <div className={classes.row}>
            <EventIcon fontSize='large' />
            <Typography variant='h6'>
              Upcoming deliveries
            </Typography>
          </div>
        </Link>
      </Paper>
    </Popover>
  );
}

export default ConsumerPopper;
