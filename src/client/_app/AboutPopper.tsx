import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Typography, Popover } from '@material-ui/core';
import Router from 'next/router'
import { howItWorksRoute } from '../../pages/how-it-works';
import { faqsRoute } from '../../pages/faq';

const useStyles = makeStyles(theme => ({
  row: {
    display: 'flex',
    flexDirection: 'column',
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

const AboutPopper: React.FC<{
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
      <Paper className={classes.paper}>
        <div className={classes.row} onClick={() => {
          Router.push(howItWorksRoute);
          onClose();
        }}>
          <Typography variant='button'>
            How it works
          </Typography>
        </div>
        <div className={classes.row} onClick={() => {
          Router.push(faqsRoute);
          onClose();
        }}>
          <Typography variant='button'>
            FAQ
          </Typography>
        </div>
      </Paper>
    </Popover>
  );
}

export default AboutPopper;
