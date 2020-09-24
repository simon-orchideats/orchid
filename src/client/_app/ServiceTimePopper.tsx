import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Popover } from '@material-ui/core';
import ServiceDateTimePicker from '../general/inputs/ServiceDateTimePicker';

const useStyles = makeStyles(theme => ({
  padding: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}));

const ServiceTimePopper: React.FC<{
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
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      <div className={classes.padding}>
        <ServiceDateTimePicker />
      </div>
    </Popover>
  );
}

export default ServiceTimePopper;
