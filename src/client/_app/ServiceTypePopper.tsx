import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Popover, Typography } from '@material-ui/core';
import ServiceTypePicker from '../general/inputs/ServiceTypePicker';

const useStyles = makeStyles(theme => ({
  padding: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  bottomMargin: {
    marginBottom: theme.spacing(2),
  }
}));

const ServiceTypePopper: React.FC<{
  open: boolean,
  onClose: () => void,
  anchorEl: Element | ((element: Element) => Element) | null | undefined
}> = ({
  open,
  onClose,
  anchorEl,
}) => {
  const onClosePopover = () => {
    onClose();
  }
  const classes = useStyles();
  return (
    <Popover
      open={open}
      onClose={onClosePopover}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      <div className={classes.padding}>
        <Typography variant='h4' className={classes.bottomMargin}>
          I want
        </Typography>
        <ServiceTypePicker />
      </div>
    </Popover>
  );
}

export default ServiceTypePopper;