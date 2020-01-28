import React, { useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Slide from '@material-ui/core/Slide';
import Close from '@material-ui/icons/Close';
import { TextField, Paper, Typography, Grid, Button } from '@material-ui/core';

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
      height: '40%',
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
  onClose: (zip: string) => void,
  defaultZip: string
}> = ({
  open,
  onClose,
  defaultZip,
}) => {
  const classes = useStyles();
  const zipRef = useRef<string>('');
  const findFood = () => {
    onClose(zipRef.current);
  }
  const justLook = () => {
    onClose('');
  }
  return (
    <Modal
      open={open}
      onClose={justLook}
      BackdropComponent={() => null}
    >
      <Slide in={open} direction='down'>
        <Paper className={classes.paper}>
          <Close onClick={justLook} className={classes.close} />
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
                      defaultValue={defaultZip}
                      onChange={e => {
                        zipRef.current = e.target.value
                      }}
                      margin='none'
                      placeholder='Zip'
                    />
                  </Grid>
                  <Grid item xs={6} sm={12}  md={3}>
                    <Button
                      variant='contained'
                      color='primary'
                      className={classes.button}
                      onClick={findFood}
                    >
                      Find food
                    </Button>
                  </Grid>
                  <Grid item xs={6} sm={12}  md={3}>
                    <Button
                      variant='outlined'
                      color='primary'
                      className={classes.button}
                      onClick={justLook}
                    >
                      Just look
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
