import { Typography, makeStyles, Grid, Container, useMediaQuery, Theme,
  // Paper
} from "@material-ui/core";
import { useTheme } from "@material-ui/styles";
import { useState, useEffect, useMemo } from "react";
import withApollo from "../client/utils/withPageApollo";
import { useGetNearbyRests, useGetTags } from "../rest/restService";
import SearchAreaModal from "../client/menu/SearchAreaModal";
import RestMenu from "../client/menu/RestMenu";
import { useGetCart, useSetSearchArea } from "../client/global/state/cartState";
import StickyDrawer from "../client/general/StickyDrawer";
// import Filter from "../client/menu/Filter";
import { Tag } from "../rest/tagModel";
import MenuCartDisplay from "../client/menu/MenuCartDisplay";
import { Order } from "../order/orderModel";
import { WeekHours, ServiceDay } from "../rest/restModel";
import { useGetConsumer } from "../consumer/consumerService";

const useStyles = makeStyles(theme => ({
  container: {
    background: 'none',
    marginTop: -theme.mixins.navbar.marginBottom,
  },
  menu: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      paddingBottom: theme.spacing(6)
    },
    width: '100%',
  },
  link: {
    color: theme.palette.common.link,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    marginRight: theme.spacing(1),
  },
  row: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
  },
  paddingTop: {
    paddingTop: theme.spacing(2),
  },
  padding: {
    padding: theme.spacing(2),
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
      top: theme.mixins.customToolbar.landscapeHeight,
    },
    [theme.mixins.customToolbar.toolbarWidthQuery]: {
      top: theme.mixins.customToolbar.smallHeight,
    },
  }
}));

const menu = () => {
  const classes = useStyles();
  const cart = useGetCart();
  const setSearchArea = useSetSearchArea();
  const allTags = useGetTags();
  const consumer = useGetConsumer();
  const [cuisines, setCuisines] = useState<string[]>([]);
  let serviceDay: ServiceDay | undefined;
  let fromTo: {
    from: string
    to: string
  } | undefined = undefined;
  if (cart) {
    serviceDay = WeekHours.getServiceDay(cart.serviceDate);
    fromTo = Order.get24HourStr(cart.serviceTime);
  }
  useEffect(() => {
    if (consumer.data && consumer.data.profile.searchArea) {
      setSearchArea(consumer.data.profile.searchArea.primaryAddr);
    }
  }, [consumer.data]);
  const rests = useGetNearbyRests(
    cart?.searchArea,
    fromTo?.from,
    fromTo?.to,
    serviceDay,
    cart?.serviceType
  );
  // const onFilterCuisines = (cuisines: string[]) => {
  //   setCuisines(cuisines);
  // };
  const allCuisines = useMemo(() => allTags.data ? Tag.getCuisines(allTags.data) : [], [allTags.data]);

  useEffect(() => {
    if (cuisines.length === 0) {
      setCuisines(allCuisines)
    }
  }, [allCuisines]);

  const allRests = rests.data;
  const RestMenus = allRests && allRests.map(rest => 
    <RestMenu
      key={rest._id}
      rest={rest}
      cuisinesFilter={allCuisines}
    />
  );
  const hasNoRests = !rests.loading && !rests.error && allRests && allRests.length === 0;
  const theme = useTheme<Theme>();
  const isMdAndUp = useMediaQuery(theme.breakpoints.up('md'));
  return (
    <Container
      maxWidth='xl'
      disableGutters
      className={classes.container}
    >
      <SearchAreaModal open={!consumer.loading && !!!cart?.searchArea} />
      <Grid container alignItems='stretch'>
        <Grid
          item
          sm={12}
          md={9}
          lg={8}
          className={classes.menu}
        >
          {/* <Paper className={classes.filters}>
            {
              isMdAndUp &&
              <div className={classes.row}>
                <Filter
                  label='Cuisines'
                  allCuisines={allCuisines}
                  cuisines={cuisines}
                  onClickCuisine={onFilterCuisines}
                />
              </div>
            }
          </Paper> */}
          {
            !!rests.loading && 
            <Typography variant='body1'>
              Loading...
            </Typography>
          }
          {
            (hasNoRests && cart) &&
            <div className={classes.padding}>
              <Typography variant='h5' className={`${classes.paddingTop} ${classes.row}`}>
                Nothing available for
              </Typography>
              <Typography variant='h5' className={`${classes.paddingTop} ${classes.row}`}>
                {cart.searchArea}
              </Typography>
              <Typography variant='h5' className={`${classes.paddingTop} ${classes.row}`}>
                on {Order.getServiceTimeStr(cart.serviceTime) === 'ASAP' ? 'ASAP' : `${cart.serviceDate} ${Order.getServiceTimeStr(cart.serviceTime)}`}
              </Typography>
            </div>
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
              {allRests && <MenuCartDisplay />}
            </StickyDrawer>
          </Grid>
        }
      </Grid>
    </Container>
  )  
}

export default withApollo(menu);

export const menuRoute = '/menu';