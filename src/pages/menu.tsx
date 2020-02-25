import { Typography, makeStyles, Grid, Container, Link, useMediaQuery, Theme } from "@material-ui/core";
import LocationOnIcon from '@material-ui/icons/LocationOn';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { useTheme } from "@material-ui/styles";
import { useState, useMemo } from "react";
import withApollo from "../client/utils/withPageApollo";
import { useGetNearbyRests } from "../rest/restService";
import ZipModal from "../client/menu/ZipModal";
import MenuCart from "../client/menu/MenuCart";
import RestMenu from "../client/menu/RestMenu";
import MenuMiniCart from "../client/menu/MenuMiniCart";
import { useGetCart } from "../client/global/state/cartState";
import StickyDrawer from "../client/general/StickyDrawer";

const useStyles = makeStyles(theme => ({
  container: {
    background: 'none',
    marginTop: -theme.mixins.navbar.marginBottom,
  },
  menu: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  link: {
    color: theme.palette.common.link,
    cursor: 'pointer',
    display: 'flex',
  },
  mini: {
    marginLeft: 'auto',
  },
  filters: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    position: 'sticky',
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
  const cartRestId = cart ? cart.RestId : null;
  const cartMeals = cart ? cart.Meals : [];
  const zip = cart && cart.Zip ? cart.Zip : '';
  const [open, setOpen] = useState(zip ? false : true);
  const rests = useGetNearbyRests(zip);
  const RestMenus = useMemo(() => ( 
    rests.data && rests.data.map(rest => 
      <RestMenu
        key={rest.Id}
        rest={rest}
        cartMeals={cartMeals}
        cartRestId={cartRestId}
      />
    )
  ), [rests.data, cartRestId]);
  const theme = useTheme<Theme>();
  const isMdAndUp = useMediaQuery(theme.breakpoints.up('md'));
  const onClickZip = () => {
    setOpen(true);
  }
  return (
    <Container
      maxWidth='xl'
      disableGutters
      className={classes.container}
    >
      <ZipModal
        open={open}
        defaultZip={zip}
        onClose={() => {
          setOpen(false);
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
          <div className={classes.filters}>
            <Link className={classes.link} color='inherit' onClick={onClickZip}>
              <LocationOnIcon />
              <Typography>{zip ? zip : 'Zip'}</Typography>
              <ArrowDropDownIcon />
            </Link>
            {!isMdAndUp &&
              <div className={classes.mini}>
                <MenuMiniCart />
              </div>
            }
          </div>
          {RestMenus}
        </Grid>
        {
          isMdAndUp &&
          <Grid
            item
            md={3}
            lg={4}
          >
            <StickyDrawer>
              <MenuCart />
            </StickyDrawer>
          </Grid>
        }
      </Grid>
    </Container>
  )  
}

export default withApollo(menu);

export const menuRoute = '/menu';