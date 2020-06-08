import { Typography, makeStyles, Grid, Container, Link, useMediaQuery, Theme, Paper } from "@material-ui/core";
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
  row: {
    display: 'flex',
  },
  right: {
    marginLeft: 'auto',
  },
  paddingTop: {
    paddingTop: theme.spacing(2),
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
  const updateCartZip = useUpdateZip()
  const zip = cart && cart.Zip ? cart.Zip : '';
  const [isZipModalOpen, setZipModalOpen] = useState(zip ? false : true);
  const [isShowingZipInput, setShowZipInput] = useState(false);
  const [zipInput, setZipInput] = useState<string>(zip);
  const allTags = useGetTags();
  const [cuisines, setCuisines] = useState<string[]>([]);
  const rests = useGetNearbyRests(zip);
  const onFilterCuisines = (cuisines: string[]) => {
    setCuisines(cuisines);
  };
  const allCuisines = useMemo(() => allTags.data ? Tag.getCuisines(allTags.data) : [], [allTags.data]);
  
  useEffect(() => {
    if (cuisines.length === 0) {
      setCuisines(allCuisines)
    }
  }, [allCuisines]);

  useEffect(() => {
    setZipInput(zip);
  }, [zip]);

  const onSearchZip = () => {
    if (zipInput) {
      sendZipMetrics(zipInput);
      updateCartZip(zipInput);
    }
    setShowZipInput(false);
  }
  const RestMenus = rests.data && rests.data.map(rest => 
    <RestMenu
      key={rest.Id}
      rest={rest}
      cuisinesFilter={cuisines}
    />
  )
  const hasNoRests = !rests.loading && !rests.error && rests.data && rests.data.length === 0;
  const theme = useTheme<Theme>();
  const isMdAndUp = useMediaQuery(theme.breakpoints.up('md'));
  const onClickZip = () => {
    setShowZipInput(true);
  }
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
          <Paper className={classes.filters}>
            {
              isMdAndUp ?
              <div className={classes.row}>
                {zipButton}
                <Filter 
                  allCuisines={allCuisines}
                  cuisines={cuisines}
                  onClickCuisine={onFilterCuisines}
                />
              </div>
            :
              rests.data &&
              <MenuMiniCart
                filter={
                  <Filter
                    allCuisines={allCuisines}
                    cuisines={cuisines}
                    onClickCuisine={onFilterCuisines}
                    zip={zipButton}
                  />
                }
              />
            }
          </Paper>
          {rests.loading && <Typography>Loading...</Typography>}
          {
            hasNoRests ?
            <Typography variant='h5' className={`${classes.paddingTop} ${classes.row}`}>
              No restaurants found for city or zip code&nbsp;
              <Link className={classes.link} color='inherit' onClick={onClickZip}>
                {zip}
              </Link>
            </Typography>
            :
            RestMenus
          }
        </Grid>
        {
          isMdAndUp &&
          <Grid
            item
            md={3}
            lg={4}
          >
            <StickyDrawer>
              {rests.data && <SideMenuCart />}
            </StickyDrawer>
          </Grid>
        }
      </Grid>
    </Container>
  )  
}

export default withApollo(menu);

export const menuRoute = '/menu';