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
import ConsumerPopper from './ConsumerPopper';
import AboutPopper from './AboutPopper';
import withClientApollo from '../utils/withClientApollo';
import { useGetConsumer, useSignIn } from '../../consumer/consumerService';
import { analyticsService } from '../utils/analyticsService';
import LogRocket from 'logrocket';
import { useGetCart } from '../global/state/cartState';
import { ServiceTypes, Order } from '../../order/orderModel';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import { Cart } from '../../order/cartModel';
import SearchAreaInput from '../general/inputs/SearchAreaInput';
import ServiceTimePopper from './ServiceTimePopper';
import ServiceTypePopper from './ServiceTypePopper';
import CartModal from './CartModal';
import { plansRoute } from '../../pages/plans';

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
    color: theme.palette.text.primary
  },
  cart: {
    color: theme.palette.text.primary
  },
  menuServiceDropdown: {
    cursor: 'pointer',
    display: 'flex',
    textDecoration: 'underline',
    color: theme.palette.common.link,
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
  container: {
    padding: 0,
  },
  toolbar: {
    display: 'flex',
    padding: 0, 
    height: theme.mixins.customToolbar.height,
    [theme.mixins.customToolbar.toolbarWidthQuery]: theme.mixins.customToolbar.smallHeight,
    [theme.mixins.customToolbar.toolbarLandscapeQuery]: theme.mixins.customToolbar.landscapeHeight
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
      marginRight: theme.spacing(1),
      height: '75%',
    },
    height: '100%',
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: theme.spacing(1),
    marginRight: theme.spacing(5),
    cursor: 'pointer',
  },
  maxWidth: {
    width: '100%',
    maxWidth: 400,
  },
  spacer: {
    height: theme.mixins.navbar.marginBottom,
    backgroundColor: theme.palette.background.default,
  },
}));

const Navbar: React.FC = () => {
  const classes = useStyles();
  const theme = useTheme();
  const cart = useGetCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const isMdAndUp = useMediaQuery(theme.breakpoints.up('md'));
  const consumer = useGetConsumer();
  const [isShowingSearchAreaInput, setShowSearchAreaInput] = useState(false);
  const signIn = useSignIn();
  const [accountAnchor, setAccountAnchor] = useState<HTMLDivElement | null>(null);
  const [aboutAnchor, setAboutAnchor] = useState<HTMLDivElement | null>(null);
  const [serviceTypeAnchor, setServiceTypeAnchor] = useState<HTMLDivElement | null>(null);
  const [serviceTimeAnchor, setServiceTimeAnchor] = useState<HTMLDivElement | null>(null);
  const onClickUser = (event: React.MouseEvent<HTMLDivElement>) => {
    setAccountAnchor(event.currentTarget);
  };
  const onClickAbout = (event: React.MouseEvent<HTMLDivElement>) => {
    setAboutAnchor(event.currentTarget);
  };
  const onClickServiceType = (event: React.MouseEvent<HTMLDivElement>) => {
    setServiceTypeAnchor(event.currentTarget);
  };
  const onClickServiceTime = (event: React.MouseEvent<HTMLDivElement>) => {
    setServiceTimeAnchor(event.currentTarget);
  };
  const onClickCart = () => {
    if (!isMdAndUp) setIsCartOpen(true);
  }
  useMemo(() => {
    const id = consumer.data && consumer.data._id;
    if (id) {
      analyticsService.setUserId(id);
      LogRocket.identify(id);
    }
  }, [consumer.data && consumer.data._id]);
  const accountOpen = !!accountAnchor;
  const aboutOpen = !!aboutAnchor;
  const serviceTypeOpen = !!serviceTypeAnchor;
  const serviceTimeOpen = !!serviceTimeAnchor;
  const router = useRouter();
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
              Hi, {consumer.data.profile.name.split(' ')[0]}
            </Typography>
            <ExpandMoreIcon />
          </div>
          :
          <AccountCircleIcon />
        }
      </div>
    )
  }
  let bar;
  if (currRoute === menuRoute) {
    if (!cart || !cart.searchArea) {
      bar = null;
      account = null;
    } else {
      const onAddrInputBlur = () => {
        setShowSearchAreaInput(false);
      }
      const onClickSearchArea = () => {
        setShowSearchAreaInput(true);
      }
      const shortAddrArr = cart.searchArea.split(' ');
      const shortAddr = shortAddrArr ? `${shortAddrArr[0]} ${shortAddrArr[1]}` : null;
      const searchArea = isShowingSearchAreaInput ?
        <div className={classes.maxWidth}>
          <SearchAreaInput onBlur={onAddrInputBlur} />
        </div>
      :
        <div className={classes.menuServiceDropdown} onClick={onClickSearchArea}>
          <Typography variant='body1'>{shortAddr}</Typography>
        </div>
      bar = (
        <>
          <CartModal
            open={isCartOpen}
            onClose={() => {
              setIsCartOpen(false);
            }}
          />
          <div className={classes.menuServiceDropdown} onClick={onClickServiceType}>
            <Typography variant='body1'>
              {cart.serviceType}
            </Typography>
          </div>
          &nbsp;
          <div className={classes.menuServiceDropdown} onClick={onClickServiceTime}>
            <Typography variant='body1'>
              {Order.getServiceTimeStr(cart.serviceTime) === 'ASAP' ? 'ASAP' : `${Order.getServiceMonthDay(cart.serviceDate)} ${Order.getServiceTimeStr(cart.serviceTime)}`}
            </Typography>
          </div>
          &nbsp;
          {cart.serviceType === ServiceTypes.Delivery ? 'to' : 'near'}
          &nbsp;
          {searchArea}
        </>
      );
      account = (
        <div className={`${classes.account} ${classes.cart}`} onClick={onClickCart}>
          <ShoppingCartIcon />&nbsp;
          <Typography variant='h6'>{Cart.getNumMeals(cart)}</Typography>
        </div>
      );
    }
  } else if (currRoute === `${checkoutRoute}`) {
    bar = (
      <div className={classes.center}>
        <div className={classes.vertCenter}>
          {menuStep}
          <ChevronRightIcon className={classes.horzMargin} />
          <Typography variant='button'>
            <b>
              Checkout
            </b>
          </Typography>
        </div>
      </div>
    )
    account = null;
  } else {
    bar = (
      <>
        <Link href={menuRoute}>
          <Typography variant='button' className={`${classes.link} ${classes.menuLink}`}>Menu</Typography>
        </Link>
        <Link href={plansRoute}>
          <Typography variant='button' className={`${classes.link} ${classes.menuLink}`}>Plans</Typography>
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
            <Link href={indexRoute}>
              <img src='/logo.png' alt='logo' className={classes.logo} />
            </Link>
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
          <ServiceTimePopper
            open={serviceTimeOpen}
            onClose={() => setServiceTimeAnchor(null)}
            anchorEl={serviceTimeAnchor}
          />
          <ServiceTypePopper
            open={serviceTypeOpen}
            onClose={() => setServiceTypeAnchor(null)}
            anchorEl={serviceTypeAnchor}
          />
        </Container>
      </AppBar>
      {/* empty child to satisfying children prop warning */}
      <Container maxWidth='lg' className={classes.spacer}><></></Container>
    </>
  );
}

export default withClientApollo(Navbar);