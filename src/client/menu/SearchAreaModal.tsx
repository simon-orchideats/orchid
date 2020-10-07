import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Slide from '@material-ui/core/Slide';
import { Paper, Typography, Grid } from '@material-ui/core';
import SearchAreaInput from '../general/inputs/SearchAreaInput';
import React from 'react';

const useStyles = makeStyles(theme => ({
  modal: {
    // need to do media query to override the inline-styles that material uses
    '@media (min-width:0px)': {
      top: `${theme.mixins.customToolbar.height}px !important`,
    },
    [theme.mixins.customToolbar.toolbarLandscapeQuery]: {
      top: `${theme.mixins.customToolbar.landscapeHeight}px !important`,
    },
    [theme.mixins.customToolbar.toolbarWidthQuery]: {
      top: `${theme.mixins.customToolbar.smallHeight}px !important`,
    },
  },
  img: {
    [theme.breakpoints.down('sm')]: {
      height: '60%',
      backgroundPosition: '50% 85%',
    },
    [theme.breakpoints.down('xs')]: {
      height: '60%',
      backgroundPosition: '50% 100%',
      top: 0,
      backgroundImage: `url(menu/chef.jpg)`,
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
  title: {
    [theme.breakpoints.down('sm')]: {
      fontSize: '2.5rem'
    },
    paddingBottom: theme.spacing(2)
  },
  paper: {
    height: '100%',
    overflowY: 'scroll',
    backgroundColor: theme.palette.background.paper,
  },
}));

const SearchAreaModal: React.FC<{
  open: boolean,
}> = ({
  open,
}) => {
  const classes = useStyles();
  return (
    <Modal
      className={classes.modal}
      open={open}
      BackdropComponent={() => null}
      disableEscapeKeyDown
    >
      <Slide in={open} direction='down'>
        <Paper className={classes.paper}>
          <Grid container className={classes.gridContainer}>
            <Grid item xs={12} md={5} lg={6} className={classes.img} />
            <Grid item xs={12} md={7} lg={6}  className={classes.input}>
              <Typography variant='h4' className={classes.title}>
                Actually support resturants (CHAGNE THIS)
              </Typography>
              <SearchAreaInput />
            </Grid>
          </Grid>
        </Paper>
      </Slide>
    </Modal>
  );
}

export default React.memo(SearchAreaModal);
