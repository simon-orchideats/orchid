import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Slide from '@material-ui/core/Slide';
import { TextField, Paper, Typography, Grid, Button } from '@material-ui/core';
import { useUpdateZip } from '../global/state/cartState';
import { sendZipMetrics } from './menuMetrics';

const useStyles = makeStyles(theme => ({
  modal: {
    // need to do media query to override the inline-styles that material uses
    '@media (min-width:0px)': {
      top: `${theme.mixins.toolbar.height}px !important`,
    },
    [theme.mixins.customToolbar.toolbarLandscapeQuery]: {
      top: `${(theme.mixins.toolbar as any)[theme.mixins.customToolbar.toolbarLandscapeQuery].height}px !important`,
    },
    [theme.mixins.customToolbar.toolbarWidthQuery]: {
      top: `${(theme.mixins.toolbar as any)[theme.mixins.customToolbar.toolbarWidthQuery].height}px !important`
    },
  },
  img: {
    [theme.breakpoints.down('sm')]: {
      backgroundPosition: '75% 50%',
    },
    [theme.breakpoints.down('xs')]: {
      height: '30%',
      backgroundPosition: '50% 100%',
      top: 0,
    },
    backgroundImage: `url(menu/chef.jpg)`,
    backgroundPosition: '50% 50%',
    backgroundSize: 'cover',
    height: '100%',
  },
  input: {
    [theme.breakpoints.down('xs')]: {
      paddingTop: 0,
      display: 'block'
    },
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: theme.spacing(4),
  },
  gridContainer: {
    height: '100%',
    alignItems: 'stretch',
  },
  button: {
    height: 56,
    width: '100%'
  },
  title: {
    [theme.breakpoints.down('sm')]: {
      fontSize: '2.5rem'
    },
    paddingBottom: theme.spacing(4)
  },
  paper: {
    height: '100%',
    overflowY: 'scroll',
    backgroundColor: theme.palette.background.paper,
  },
}));

const ZipModal: React.FC<{
  open: boolean,
  onClose: () => void,
  defaultZip: string
}> = ({
  open,
  onClose,
  defaultZip,
}) => {
  const classes = useStyles();
  const [error, setError] = useState('');
  const [zip, setZip] = useState<string>('');
  const updateCartZip = useUpdateZip()
  const findFood = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!zip) {
      setError('Enter zip');
      return;
    }
    sendZipMetrics(zip);
    updateCartZip(zip);
    onClose();
  }
  return (
    <Modal
      className={classes.modal}
      open={open}
      onClose={onClose}
      BackdropComponent={() => null}
      disableEscapeKeyDown
    >
      <Slide in={open} direction='down'>
        <Paper className={classes.paper}>
          <Grid container className={classes.gridContainer}>
            <Grid item xs={12} sm={5} md={7} className={classes.img} />
            <Grid item xs={12} sm={7} md={5} className={classes.input}>
              <form onSubmit={findFood}>
                <Typography variant='h3' className={classes.title}>
                  Subscribe to meal plans from local restaurants you love
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={12} md={6}>
                    <TextField
                      hiddenLabel
                      fullWidth
                      variant='outlined'
                      error={!!error}
                      helperText={error}
                      defaultValue={defaultZip}
                      onChange={e => setZip(e.target.value)}
                      margin='none'
                      placeholder='Zip'
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} md={6}>
                    <Button
                      variant='contained'
                      color='primary'
                      className={classes.button}
                      type='submit'
                    >
                      Find food
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Grid>
          </Grid>
        </Paper>
      </Slide>
    </Modal>
  );
}

export default ZipModal;
