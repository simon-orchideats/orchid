import { Typography, makeStyles, Grid, Container, Link } from "@material-ui/core";
import LocationOnIcon from '@material-ui/icons/LocationOn';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { CSSProperties } from "@material-ui/styles";
import { useState } from "react";
import withApollo from "../client/utils/withPageApollo";
import { useGetNearbyRests } from "../rest/restService";
import ZipModal from "../client/menu/ZipModal";
import SideCart from "../client/menu/SideCart";
import RestMenu from "../client/menu/RestMenu";

const useMenuStyles = makeStyles(theme => ({
  container: {
    background: 'none',
    marginTop: -theme.mixins.navbar.marginBottom,
  },
  menu: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  cart: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    position: 'sticky',
    top: theme.mixins.toolbar.height,
    height: `calc(100vh - ${theme.mixins.toolbar.height}px)`,
    [theme.mixins.customToolbar.toolbarLandscapeQuery]: {
      height: `calc(100vh - ${(theme.mixins.toolbar[theme.mixins.customToolbar.toolbarLandscapeQuery]! as CSSProperties).height}px)`,
      top: (theme.mixins.toolbar[theme.mixins.customToolbar.toolbarLandscapeQuery]! as CSSProperties).height,
    },
    [theme.mixins.customToolbar.toolbarWidthQuery]: {
      height: `calc(100vh - ${(theme.mixins.toolbar[theme.mixins.customToolbar.toolbarWidthQuery]! as CSSProperties).height}px)`,
      top: (theme.mixins.toolbar[theme.mixins.customToolbar.toolbarWidthQuery]! as CSSProperties).height
    },
  },
  link: {
    color: theme.palette.common.link,
    cursor: 'pointer',
    display: 'flex',
  },
  filters: {
    display: 'flex',
    justifyContent: 'flex-end',
  }
}));

const menu = () => {
  const classes = useMenuStyles();
  const [open, setOpen] = useState(true);
  const [zip, setZip] = useState('');
  const rests = useGetNearbyRests(zip);
  const onClickZip = () => {
    setOpen(true);
  }
  return (
    <Container
      maxWidth='lg'
      disableGutters
      className={classes.container}
    >
      <ZipModal
        open={open}
        defaultZip={zip}
        onClose={zip => {
          setZip(zip);
          setOpen(false);
        }}
      />
      <Grid container alignItems='stretch'>
        <Grid
          item
          xs={9}
          className={classes.menu}
        >
          <div className={classes.filters}>
            <Link className={classes.link} color='inherit' onClick={onClickZip}>
              <LocationOnIcon />
              <Typography>{zip ? zip : 'Zip'}</Typography>
              <ArrowDropDownIcon />
            </Link>
          </div>
          {rests.data && rests.data.map(rest => 
            <RestMenu key={rest.Id} rest={rest} />
          )}
        </Grid>
        <Grid
          item
          xs={3}
          className={classes.cart}
        >
          <SideCart />
        </Grid>
      </Grid>
    </Container>
  )  
}

export default withApollo(menu);

export const menuRoute = 'menu';