import React, { useState, useMemo } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import Link from 'next/link'
import { Container, Typography, useMediaQuery, Button } from '@material-ui/core';
import { menuRoute } from '../../pages/menu';
import { indexRoute } from '../../pages';
import { useRouter } from 'next/router';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { checkoutRoute } from '../../pages/checkout';
import { deliveryRoute } from '../../pages/delivery';
import ConsumerPopper from './ConsumerPopper';
import AboutPopper from './AboutPopper';
import withClientApollo from '../utils/withClientApollo';
import { useGetConsumer, useSignIn } from '../../consumer/consumerService';
import { analyticsService } from '../utils/analyticsService';
import LogRocket from 'logrocket';

const useStyles = makeStyles(theme => ({
  link: {
    maxWidth: 110,
    flex: 1,
    cursor: 'pointer',
  },
  account: {
    marginLeft: 'auto',
    marginRight: theme.spacing(1),
    height: '100%',
    cursor: 'pointer',
    justifyContent: 'flex-end',
    display: 'flex',
    alignItems: 'center',
  },
  about: {
    minWidth: 50,
    cursor: 'pointer',
    display: 'flex',
  },
  hi: {
    minWidth: 95,
    display: 'flex',
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
  },
  horzMargin: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.down(550)]: {
      marginLeft: 0,
      marginRight: 0,
    },
  },
  vertCenter: {
    display: 'flex',
    alignItems: 'center',
  },
  menuLink: {
    maxWidth: 65,
  },
  logo: {
    [theme.breakpoints.down('xs')]: {
      marginRight: theme.spacing(2)
    },
    height: '100%',
    paddingTop: 2,
    paddingBottom: 2,
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
  const [accountAnchor, setAccountAnchor] = useState<HTMLDivElement | null>(null);
  const [aboutAnchor, setAboutAnchor] = useState<HTMLDivElement | null>(null);
  const onClickUser = (event: React.MouseEvent<HTMLDivElement>) => {
    setAccountAnchor(event.currentTarget);
  };
  const onClickAbout = (event: React.MouseEvent<HTMLDivElement>) => {
    setAboutAnchor(event.currentTarget);
  };
  useMemo(() => {
    const id = consumer.data && consumer.data.Id;
    if (id) {
      analyticsService.setUserId(id);
      LogRocket.identify(id);
    }
  }, [consumer.data && consumer.data.Id]);
  const accountOpen = !!accountAnchor;
  const aboutOpen = !!aboutAnchor;
  const router = useRouter();
  const urlQuery = router.query;
  const updatingParam = urlQuery.updating;
  const isUpdating = !!updatingParam && updatingParam === 'true'
  const currRoute = router.pathname;
  const menuStep = (
    <Link href={menuRoute}>
      <Typography variant='button' className={classes.link}>
        Menu
      </Typography>
    </Link>
  );
  
  let account: JSX.Element | null = (
    <Button
      variant='text'
      className={classes.account}
      onClick={() => signIn()}
    >
      Login
    </Button>
  )

  if (consumer.data) {
    account = (
      <div className={classes.account} onClick={onClickUser}>
        {
          isMdAndUp ?
          <div className={classes.hi}>
            <Typography variant='body1'>
              Hi, {consumer.data.Profile.Name.split(' ')[0]}
            </Typography>
            <ExpandMoreIcon />
          </div>
          :
          <AccountCircleIcon />
        }
      </div>
    )
  }
  let barIsStep = true;
  let bar;
  if (currRoute === `${menuRoute}` && isUpdating) {
    bar = (
      <div className={classes.center}>
        <div className={classes.vertCenter}>
          <Typography variant='button'>
            Menu
          </Typography>
          <ChevronRightIcon className={classes.horzMargin} />
          <Typography variant='button' className={classes.disabled}>
            Delivery
          </Typography>
        </div>
      </div>
    )
    account = null;
  } else if (currRoute === `${deliveryRoute}` && isUpdating) {
    bar = (
      <div className={classes.center}>
        <div className={classes.vertCenter}>
          <Button variant='text' onClick={() => router.back()}>
            Menu
          </Button>
          <ChevronRightIcon className={classes.horzMargin} />
          <Typography variant='button' color='primary'>
            Delivery
          </Typography>
        </div>
      </div>
    )
    account = null;
  } else if (currRoute === `${deliveryRoute}`) {
    bar = (
      <div className={classes.center}>
        <div className={classes.vertCenter}>
          {menuStep}
          <ChevronRightIcon className={classes.horzMargin} />
          <Typography variant='button' color='primary'>
            Delivery
          </Typography>
          <ChevronRightIcon className={classes.horzMargin} />
          <Typography variant='button' className={classes.disabled}>
            Checkout
          </Typography>
        </div>
      </div>
    )
    account = null;
  } else if (currRoute === `${checkoutRoute}`) {
    bar = (
      <div className={classes.center}>
        <div className={classes.vertCenter}>
          {menuStep}
          <ChevronRightIcon className={classes.horzMargin} />
          <Link href={deliveryRoute}>
            <Typography variant='button' className={classes.link}>
              Delivery
            </Typography>
          </Link>
          <ChevronRightIcon className={classes.horzMargin} />
          <Typography variant='button' color='primary'>
            Checkout
          </Typography>
        </div>
      </div>
    )
    account = null;
  } else {
    barIsStep = false;
    bar = (
      <>
        <Link href={menuRoute}>
          <Typography variant='button' className={`${classes.link} ${classes.menuLink}`}>Menu</Typography>
        </Link>
        <div className={classes.about} onClick={onClickAbout}>
          <Typography variant='button' className={classes.link}>About</Typography>
          <ExpandMoreIcon />
        </div>
      </>
    )
  }
  return (
    <>
      <AppBar
        position='sticky'
        color='default'
        style={accountOpen ? { paddingRight: 17, width: '100vw'} : undefined}
      >
        <Container className={classes.container} maxWidth='lg'>
          <Toolbar className={classes.toolbar}>
            {
              (isMdAndUp || !barIsStep) &&
              <Link href={indexRoute}>
                <img src='/logo.png' alt='logo' className={classes.logo} />
              </Link>
            }
            {bar}
            {account}
          </Toolbar>
          <ConsumerPopper
            open={accountOpen}
            onClose={() => setAccountAnchor(null)}
            anchorEl={accountAnchor}
          />
          <AboutPopper
            open={aboutOpen}
            onClose={() => setAboutAnchor(null)}
            anchorEl={aboutAnchor}
          />
        </Container>
      </AppBar>
      {/* empty child to satisfying children prop warning */}
      <Container maxWidth='lg' className={classes.spacer}><></></Container>
    </>
  );
}

export default withClientApollo(Navbar);