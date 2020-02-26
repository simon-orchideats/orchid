import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Slide from '@material-ui/core/Slide';
import { TextField, Paper, Typography, Grid, Button } from '@material-ui/core';
import { useUpdateZip } from '../global/state/cartState';

const useStyles = makeStyles(theme => ({
  close: {
    [theme.breakpoints.down('xs')]: {
      color: theme.palette.common.white
    },
    cursor: 'pointer',
    position: 'absolute',
    top: theme.spacing(4),
    right: theme.spacing(4),
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
    height: '100vh',
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
  const findFood = () => {
    if (!zip) {
      setError('Enter zip');
      return;
    }
    updateCartZip(zip);
    onClose();
  }
  return (
    <Modal
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
              <div>
                <Typography variant='h3' className={classes.title}>
                  Meal plans from restaurants you love
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
                      onClick={findFood}
                    >
                      Find food
                    </Button>
                  </Grid>
                </Grid>
              </div>
            </Grid>
          </Grid>
        </Paper>
      </Slide>
    </Modal>
  );
}

export default ZipModal;
