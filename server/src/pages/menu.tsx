import { Card, CardMedia, CardContent, Typography, makeStyles, Grid, Button, Container, Chip, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, Link } from "@material-ui/core";
import AddIcon from '@material-ui/icons/add';
import RemoveIcon from '@material-ui/icons/remove';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { CSSProperties } from "@material-ui/styles";
import { useState, ChangeEvent, useRef } from "react";
import { useAddMealToCart, useGetCart, useRemoveMealFromCart } from "../client/global/state/cartState";
import { Meal } from "../rest/mealModel";
import withApollo from "../client/utils/withPageApollo";
import { useGetNearbyRests } from "../rest/restService";
import { Rest } from "../rest/restModel";
import ZipModal from "../client/menu/ZipModal";
import SideCart from "../client/menu/SideCart";

const useMenuItemStyles = makeStyles(theme => ({
  card: {
    maxWidth: 225,
    background: 'none',
    textAlign: 'center',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  scaler: {
    width: '100%',
    paddingBottom: '100%',
    position: 'relative',
  },
  img: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  actionBar: {
    display: 'flex',
  },
  minusButton: {
    backgroundColor: `${theme.palette.grey[600]}`,
    '&:hover': {
      backgroundColor: theme.palette.grey[800],
    },
    '&:disabled': {
      backgroundColor: theme.palette.grey[300],
    },
  },
  button: {
    flex: 0.15,
    boxShadow: 'none',
    color: `${theme.palette.common.white} !important`,
    minWidth: theme.spacing(4),
  },
  chip: {
    flex: 1,
    fontSize: '1.2rem',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  disabledChip: {
    color: theme.palette.text.disabled,
  }
}));

const MenuItem: React.FC<{
  meal: Meal,
  restId: string,
}> = ({
  meal,
  restId
}) => {
  const classes = useMenuItemStyles();
  const cart = useGetCart();
  const cartMeal = cart && cart.Meals.filter(m => m.Id === meal.Id);
  const defaultCount = cartMeal ? cartMeal.length : 0;
  const [count, updateCount] = useState(defaultCount);
  const addMealToCart = useAddMealToCart();
  const removeMealFromCart = useRemoveMealFromCart();
  const onAddMeal = () => {
    updateCount(count + 1);
    addMealToCart(new Meal(meal), restId);
  }
  const onRemoveMeal = () => {
    updateCount(count - 1);
    removeMealFromCart(meal.Id);
  }
  return (
    <Card elevation={0} className={classes.card}>
      <div className={classes.scaler}>
        <CardMedia
          className={classes.img}
          image={meal.Img}
          title={meal.Img}
        />
      </div>
      <CardContent>
        <div className={classes.actionBar}>
          <Button
            size='small'
            variant='contained'
            disabled={!count}
            className={`${classes.button} ${classes.minusButton}`}
            onClick={() => onRemoveMeal()}
          >
            <RemoveIcon />
          </Button>
          <Chip
            className={classes.chip}
            disabled={!count}
            label={count}
            variant='outlined'
            classes={{
              disabled: classes.disabledChip
            }}
          />
          <Button
            size='small'
            variant='contained'
            color='primary'
            disabled={cart && cart.RestId ? cart.RestId !== restId : false}
            className={classes.button}
            onClick={() => onAddMeal()}
          >
            <AddIcon />
          </Button>
        </div>
        <Typography gutterBottom variant='subtitle1'>
          {meal.Name.toUpperCase()}
        </Typography>
      </CardContent>
    </Card>
  )
}

const useRestMenuStyles = makeStyles(theme => ({
  restTitle: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(1),
  },
}))

const RestMenu: React.FC<{
  rest: Rest
}> = ({
  rest
}) => {
  const classes = useRestMenuStyles();
  const cart = useGetCart();
  const expansionBeforeOutsideClosed = useRef(true);
  const lastChangeWasManual = useRef(false);
  const wasOutsideClosed = useRef(false); 
  const wasOutsideOpened = useRef(false); 
  const [expanded, setExpanded] = useState(true);
  const [isForcedOpen, setForcedOpen] = useState(false);

  if (cart && cart.RestId && cart.RestId !== rest.Id && !wasOutsideClosed.current && !isForcedOpen) {
    expansionBeforeOutsideClosed.current = expanded;
    lastChangeWasManual.current = false;
    wasOutsideClosed.current = true;
    wasOutsideOpened.current = false;
    setExpanded(false);
  }

  if (cart && !cart.RestId) {
    wasOutsideClosed.current = false;
    if (!wasOutsideOpened.current && !lastChangeWasManual.current) {
      setExpanded(expansionBeforeOutsideClosed.current);
      wasOutsideOpened.current = true;
    }
    if (isForcedOpen) setForcedOpen(false);
  }

  const forceToggle = (_e: ChangeEvent<{}>, newExpansion: boolean) => {
    lastChangeWasManual.current = true;
    setExpanded(newExpansion);
  }
  return (
    <ExpansionPanel expanded={expanded} onChange={forceToggle}>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant='h4' className={classes.restTitle}>
          {rest.Profile.Name}
        </Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <Grid container>
          {rest.Menu.map(meal => (
            <Grid
              item
              key={meal.Id}
              xs={6}
              sm={4}
              md={3}
            >
              <MenuItem restId={rest.Id} meal={meal} />
            </Grid>
          ))}
        </Grid>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  )
}

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