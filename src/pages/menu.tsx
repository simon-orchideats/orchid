import { Typography, makeStyles, Grid, Container, Link, useMediaQuery, Theme, InputLabel, Select, MenuItem, FormControl } from "@material-ui/core";
import LocationOnIcon from '@material-ui/icons/LocationOn';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { useTheme } from "@material-ui/styles";
import { useState, useMemo, useEffect } from "react";
import withApollo from "../client/utils/withPageApollo";
import { useGetNearbyRests } from "../rest/restService";
import ZipModal from "../client/menu/ZipModal";
import SideMenuCart from "../client/menu/SideMenuCart";
import RestMenu from "../client/menu/RestMenu";
import MenuMiniCart from "../client/menu/MenuMiniCart";
import { useGetCart, useUpdateCartPlanId } from "../client/global/state/cartState";
import StickyDrawer from "../client/general/StickyDrawer";
import { useGetAvailablePlans } from "../plan/planService";

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
  smallPaddingBottom: {
    paddingBottom: theme.spacing(2),
  },
  input: {
    alignSelf: 'stretch',
    marginLeft: theme.spacing(2),
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
  const sortedPlans = useGetAvailablePlans();
  const defaultPlan = cart && cart.StripePlanId ? cart.StripePlanId : ''
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(defaultPlan);
  const setCartStripePlanId = useUpdateCartPlanId();
  const updatePlanId = (planId: string) => {
    setCartStripePlanId(planId);
    setSelectedPlanId(planId);
  };
  useEffect(() => {
    if ((!cart || !cart.StripePlanId) && sortedPlans.data) {
      updatePlanId(sortedPlans.data[0].StripeId);
    }
  }, [sortedPlans.data])
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
          md={8}
          lg={9}
          className={classes.menu}
        >
          <div className={classes.filters}>
            <Link className={classes.link} color='inherit' onClick={onClickZip}>
              <LocationOnIcon />
              {isMdAndUp &&
                <>
                  <Typography>{zip ? zip : 'Zip'}</Typography>
                  <ArrowDropDownIcon />
                </>
              }
            </Link>
            <FormControl variant='filled' className={`${classes.input} ${classes.smallPaddingBottom}`}>
              <InputLabel>
                Plan
              </InputLabel>
              <Select
                value={selectedPlanId}
                onChange={e => updatePlanId(e.target.value as string)}
              >
                {sortedPlans.data && sortedPlans.data.map(plan => (
                  <MenuItem key={plan.StripeId} value={plan.StripeId}>
                    {plan.MealCount} (${plan.MealPrice.toFixed(2)} ea)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
            md={4}
            lg={3}
          >
            <StickyDrawer>
              <SideMenuCart />
            </StickyDrawer>
          </Grid>
        }
      </Grid>
    </Container>
  )  
}

export default withApollo(menu);

export const menuRoute = '/menu';