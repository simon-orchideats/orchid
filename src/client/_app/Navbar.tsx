import React, { useState } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import Link from 'next/link'
import { Container, Typography, useMediaQuery, Button } from '@material-ui/core';
import { howItWorksRoute } from '../../pages/how-it-works';
import { plansRoute } from '../../pages/plans';
import { menuRoute } from '../../pages/menu';
import { indexRoute } from '../../pages';
import { useRouter } from 'next/router';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { checkoutRoute } from '../../pages/checkout';
import { deliveryRoute } from '../../pages/delivery';
import ConsumerPopper from './ConsumerPopper';
import withClientApollo from '../utils/withClientApollo';
import { useGetConsumer, useSignIn } from '../../consumer/consumerService';

const useStyles = makeStyles(theme => ({
  link: {
    maxWidth: 110,
    flex: 1,
    cursor: 'pointer',
  },
  account: {
    marginLeft: 'auto',
    marginRight: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    minWidth: 95,
    cursor: 'pointer',
  },
  how: {
    marginRight: theme.spacing(1),
  },
  container: {
    padding: 0,
  },
  disabled: {
    color: theme.palette.action.disabled,
  },
  toolbar: {
    display: 'flex',
    padding: 0, 
  },
  center: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    [theme.breakpoints.down(550)]: {
      display: 'none',
    },
  },
  horzMargin: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
  vertCenter: {
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    [theme.breakpoints.down('xs')]: {
      width: 100,
      marginRight: theme.spacing(2)
    },
    width: 150,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: theme.spacing(1),
    marginRight: theme.spacing(5),
    cursor: 'pointer',
  },
  spacer: {
    height: theme.mixins.navbar.marginBottom,
    backgroundColor: theme.palette.background.default,
  },
}));

const Navbar: React.FC = () => {
  const classes = useStyles();
  const theme = useTheme();
  const isMdAndUp = useMediaQuery(theme.breakpoints.up('md'));
  const consumer = useGetConsumer();
  const signIn = useSignIn();
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const onClickUser = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const open = !!anchorEl;
  const currRoute = useRouter().pathname;
  const menuStep = (
    <Link href={menuRoute}>
      <Typography
        variant='button'
        color='primary'
        className={classes.link}
      >
        Menu
      </Typography>
    </Link>
  );
  let bar;
  if (currRoute === `${deliveryRoute}`) {
    bar = (
      <div className={classes.center}>
        <div className={classes.vertCenter}>
          {menuStep}
          <ChevronRightIcon className={classes.horzMargin} />
          <Typography variant='button'>
            Delivery
          </Typography>
          <ChevronRightIcon className={classes.horzMargin} />
          <Typography variant='button' className={classes.disabled}>
            Checkout
          </Typography>
        </div>
      </div>
    )
  } else if (currRoute === `${checkoutRoute}`) {
    bar = (
      <div className={classes.center}>
        <div className={classes.vertCenter}>
          {menuStep}
          <ChevronRightIcon className={classes.horzMargin} />
          <Link href={deliveryRoute}>
            <Typography variant='button' color='primary' className={classes.link}>
              Delivery
            </Typography>
          </Link>
          <ChevronRightIcon className={classes.horzMargin} />
          <Typography variant='button'>
            Checkout
          </Typography>
        </div>
      </div>
    )
  } else {
    bar = (
      <>
        <Link href={plansRoute}>
          <Typography variant='button' className={classes.link}>Plans</Typography>
        </Link>
        <Link href={menuRoute}>
          <Typography variant='button' className={classes.link}>Menu</Typography>
        </Link>
        <Link href={howItWorksRoute}>
          <Typography variant='button' className={`${classes.link} ${classes.how}`}>How it works</Typography>
        </Link>
      </>
    )
  }
  const account = consumer.data ?
    <div className={classes.account} onClick={onClickUser}>
      {
        isMdAndUp ?
        <>
          <Typography variant='body1'>
            Hi, Simon
          </Typography>
          <ExpandMoreIcon />
        </>
        :
        <AccountCircleIcon />
      }
    </div>
  :
    <Button
      variant='text'
      className={classes.account}
      onClick={() => signIn()}
    >
      Login
    </Button>
  return (
    <>
      <AppBar
        position='sticky'
        color='default'
        style={open ? { paddingRight: 17, width: '100vw'} : undefined}
      >
        <Container className={classes.container} maxWidth='lg'>
          <Toolbar className={classes.toolbar}>
            <Link href={indexRoute}>
              <img src='/logo.png' alt='logo' className={classes.logo} />
            </Link>
            {bar}
            {account}
          </Toolbar>
          <ConsumerPopper
            open={open}
            onClose={() => setAnchorEl(null)}
            anchorEl={anchorEl}
          />
        </Container>
      </AppBar>
      {/* empty child to satisfying children prop warning */}
      <Container maxWidth='lg' className={classes.spacer}><></></Container>
    </>
  );
}

export default withClientApollo(Navbar);