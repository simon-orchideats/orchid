import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Snackbar, SnackbarContent, Button } from '@material-ui/core';
import withClientApollo from '../utils/withClientApollo';
import { useGetNotification, useClearNotification } from '../global/state/notificationState';
import { NotificationType, Notification } from './notificationModel';

const useStyles = makeStyles(theme => ({
  snackContent: ({ notification }: { notification: Notification | null }) => ({
      backgroundColor: theme.palette.common[notification ? notification.Type : NotificationType.success],
      fontWeight: theme.typography.fontWeightBold,
  }),
  confirm: {
    color: theme.palette.common.white,
  }
}));

const Notifier: React.FC = () => {
  const notification = useGetNotification();
  const classes = useStyles({ notification });
  const clearNotification = useClearNotification();
  if (!notification) return null;
  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      autoHideDuration={notification.DoesAutoHide ? 2000 : null}
      open={!!notification.Message}
      onClose={clearNotification} // so clicking outside the snack also closes
    >
      <SnackbarContent
        message={notification.Message}
        className={classes.snackContent}
        action={
          <Button className={classes.confirm} onClick={clearNotification}>OKAY</Button>
        }
      />
    </Snackbar>
  );
}

export default withClientApollo(Notifier);