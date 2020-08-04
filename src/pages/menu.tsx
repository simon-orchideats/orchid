import { Typography, makeStyles, Grid, Container, Link, useMediaQuery, Theme, Paper, Slide, Fab } from "@material-ui/core";
import LocationOnIcon from '@material-ui/icons/LocationOn';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { useTheme } from "@material-ui/styles";
import { useState, useEffect, useMemo } from "react";
import withApollo from "../client/utils/withPageApollo";
import { useGetNearbyRests, useGetTags } from "../rest/restService";
import ZipModal from "../client/menu/ZipModal";
import SideMenuCart from "../client/menu/SideMenuCart";
import RestMenu from "../client/menu/RestMenu";
import MenuMiniCart from "../client/menu/MenuMiniCart";
import { useGetCart, useUpdateZip } from "../client/global/state/cartState";
import StickyDrawer from "../client/general/StickyDrawer";
import Filter from "../client/menu/Filter";
import { Tag } from "../rest/tagModel";
import SearchInput from "../client/general/inputs/SearchInput";
import { sendZipMetrics } from "../client/menu/menuMetrics";
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import RemoveShoppingCartIcon from '@material-ui/icons/RemoveShoppingCart';
import { Cart } from "../order/cartModel";
import { useNotify } from "../client/global/state/notificationState";
import Notifier from "../client/notification/Notifier";
import { NotificationType } from "../client/notification/notificationModel";

const useStyles = makeStyles(theme => ({
  container: {
    background: 'none',
    marginTop: -theme.mixins.navbar.marginBottom,
  },
  menu: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    width: '100%',
  },
  link: {
    color: theme.palette.common.link,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    marginRight: theme.spacing(1),
  },
  fab: {
    zIndex: 1,
    position: 'fixed',
    top: '50%',
    right: theme.spacing(2),
  },
  removeCart: {
    backgroundColor: `${theme.palette.secondary.light} !important`,
    color: theme.palette.primary.main,
  },
  showCart: {
    backgroundColor: `${theme.palette.primary.main} !important`,
    color: theme.palette.common.white,
  },
  row: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
  },
  right: {
    marginLeft: 'auto',
  },
  paddingTop: {
    paddingTop: theme.spacing(2),
  },
  marginLeft: {
    marginLeft: theme.spacing(1),
  },
  filters: {
    [theme.breakpoints.up('md')]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
    paddingLeft: 4,
    paddingRight: 4,
    display: 'flex',
    alignItems: 'center',
    position: 'sticky',
    flexWrap: 'wrap',
    backgroundColor: theme.palette.background.paper,
    zIndex: theme.zIndex.appBar - 1,
    top: theme.mixins.toolbar.height,
    minHeight: theme.spacing(8),
    [theme.mixins.customToolbar.toolbarLandscapeQuery]: {
      top: (theme.mixins.toolbar as any)[theme.mixins.customToolbar.toolbarLandscapeQuery].height,
    },
    [theme.mixins.customToolbar.toolbarWidthQuery]: {
      top: (theme.mixins.toolbar as any)[theme.mixins.customToolbar.toolbarWidthQuery].height,
    },
  }
}));

const menu = () => {
  const classes = useStyles();
  const cart = useGetCart();
  const notify = useNotify();
  const updateCartZip = useUpdateZip()
  const zip = cart && cart.Zip ? cart.Zip : '';
  const [didShowPromo, setDidShowPromo] = useState<boolean>(false);
  const [isZipModalOpen, setZipModalOpen] = useState(zip ? false : true);
  const [isShowingZipInput, setShowZipInput] = useState(false);
  const [zipInput, setZipInput] = useState<string>(zip);
  const allTags = useGetTags();
  const [cuisines, setCuisines] = useState<string[]>([]);
  const rests = useGetNearbyRests(zip);
  const [showMiniCart, setShowMiniCart] = useState(true);
  const onFilterCuisines = (cuisines: string[]) => {
    setCuisines(cuisines);
  };
  const allCuisines = useMemo(() => allTags.data ? Tag.getCuisines(allTags.data) : [], [allTags.data]);
  
  useEffect(() => {
    if (!didShowPromo && !isZipModalOpen) {
      notify('Promo auto applied at checkout!', NotificationType.success, false);
      setDidShowPromo(true);
    }
  }, [didShowPromo, isZipModalOpen]);

  useEffect(() => {
    if (cuisines.length === 0) {
      setCuisines(allCuisines)
    }
  }, [allCuisines]);

  useEffect(() => {
    setZipInput(zip);
  }, [zip]);

  const onClickFab = () => {
    setShowMiniCart(!showMiniCart);
  }

  const onSearchZip = () => {
    if (zipInput) {
      sendZipMetrics(zipInput);
      updateCartZip(zipInput);
    }
    setShowZipInput(false);
  }
  const allRests = rests.data;
  const RestMenus = allRests && allRests.map(rest => 
    <RestMenu
      key={rest.Id}
      rest={rest}
      cuisinesFilter={cuisines}
    />
  )
  const hasNoRests = !rests.loading && !rests.error && allRests && allRests.length === 0;
  const theme = useTheme<Theme>();
  const isMdAndUp = useMediaQuery(theme.breakpoints.up('md'));
  const onClickZip = () => {
    setShowZipInput(true);
  }
  // const SurpriseMe = allRests && allRests.length > 0 ? 
  //   <Button
  //     variant='outlined'
  //     color='primary'
  //     onClick={() => {
  //       clearCartMeals();
  //       for (let i = 0; i < 4; i++) {
  //         const chooseRandomRest = getItemChooser(allRests);
  //         const rest = chooseRandomRest();
  //         const m = Meal.chooseRandomMeals(
  //           rest.menu,
  //           1,
  //           rest._id,
  //           rest.profile.name,
  //           rest.taxRate,
  //           rest.Hours,
  //         )[0];
  //         addMeal(
  //           m.mealId,
  //           new DeliveryMeal(m),
  //           m.choices,
  //           m.restId,
  //           m.restName,
  //           m.taxRate,
  //           new Hours(m.hours),
  //         );
  //       }
  //     }}
  //   >
  //     Surprise me
  //   </Button>
  // :
  //   null
  const zipButton = isShowingZipInput ?
    <SearchInput 
      search={zipInput}
      onBlur={onSearchZip}
      onSearchChange={setZipInput}
      onSearch={onSearchZip}
    />
  :
    (
      <Link
        className={classes.link}
        color='inherit'
        onClick={onClickZip}
      >
        <LocationOnIcon />
        <Typography>{zip ? zip : 'Zip'}</Typography>
        <ArrowDropDownIcon />
      </Link>
    )
  return (
    <Container
      maxWidth='xl'
      disableGutters
      className={classes.container}
    >
      <Notifier />
      {
        !isMdAndUp &&
        <Fab
          onClick={onClickFab}
          className={`
            ${classes.fab}
            ${showMiniCart ? classes.removeCart : classes.showCart}
          `}
        >
          {
            showMiniCart ?
            <>
              <RemoveShoppingCartIcon />
              <Typography variant='body1'>
                {cart ? Cart.getNumMeals(cart.AllMeals) : 0}
              </Typography>
            </>
            :
            <>
              <ShoppingCartIcon />
              <Typography variant='body1'>
                {cart ? Cart.getNumMeals(cart.AllMeals) : 0}
              </Typography>
            </>
          }
        </Fab>
      }
      <ZipModal
        open={isZipModalOpen}
        defaultZip={zip}
        onClose={() => {
          setZipModalOpen(false);
        }}
      />
      <Grid container alignItems='stretch'>
        <Grid
          item
          sm={12}
          md={9}
          lg={8}
          className={classes.menu}
        >
          <Slide
            direction='down'
            in={isMdAndUp || showMiniCart}
            timeout={{
              enter: 0,
              exit: 700,
            }}
          >
            <Paper className={classes.filters}>
              {
                isMdAndUp ?
                <div className={classes.row}>
                  {zipButton}
                  <Filter
                    label='Cuisines'
                    allCuisines={allCuisines}
                    cuisines={cuisines}
                    onClickCuisine={onFilterCuisines}
                  />
                </div>
                :
                <MenuMiniCart
                  filter={
                    <Filter
                      label='Filter'
                      allCuisines={allCuisines}
                      cuisines={cuisines}
                      onClickCuisine={onFilterCuisines}
                      zip={zipButton}
                    />
                  }
                />
              }
            </Paper>
          </Slide>
          {rests.loading && <Typography>Loading...</Typography>}
          {
            hasNoRests &&
            <Typography variant='h5' className={`${classes.paddingTop} ${classes.row}`}>
              Coming soon to {zip}. Please filter again with a different zip code or city
            </Typography>
          }
          {!hasNoRests && !rests.error && RestMenus}
        </Grid>
        {
          isMdAndUp &&
          <Grid
            item
            md={3}
            lg={4}
          >
            <StickyDrawer>
              {allRests && <SideMenuCart />}
            </StickyDrawer>
          </Grid>
        }
      </Grid>
    </Container>
  )  
}

export default withApollo(menu);

export const menuRoute = '/menu';