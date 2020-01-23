import { Card, CardMedia, CardContent, Typography, makeStyles, Grid, TextField, Button, Container } from "@material-ui/core";
import AddIcon from '@material-ui/icons/add';
import RemoveIcon from '@material-ui/icons/remove';
import { CSSProperties } from "@material-ui/styles";

const useStyles = makeStyles(theme => ({
  container: {
    background: 'none',
    marginTop: -theme.mixins.navbar.marginBottom,
    height: `calc(100vh - ${theme.mixins.toolbar.height}px)`,
    [theme.mixins.customToolbar.toolbarLandscapeQuery]: {
      height: `calc(100vh - ${(theme.mixins.toolbar[theme.mixins.customToolbar.toolbarLandscapeQuery]! as CSSProperties).height}px)`
    },
    [theme.mixins.customToolbar.toolbarWidthQuery]: {
      height: `calc(100vh - ${(theme.mixins.toolbar[theme.mixins.customToolbar.toolbarWidthQuery]! as CSSProperties).height}px)`
    }
  },
  button: {
    boxShadow: 'none',
    color: theme.palette.common.white,
    minWidth: theme.spacing(4),
  },
  scaler: {
    width: '100%',
    paddingBottom: '100%',
    position: 'relative',
  },
  card: {
    maxWidth: 225,
    background: 'none',
    textAlign: 'center',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  actionBar: {
    display: 'flex',
  },
  restTitle: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    paddingLeft: theme.spacing(1),
  },
  img: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gridContainer: {
    height: '100%'
  },
  cart: {
    backgroundColor: theme.palette.background.paper,
    paddingTop: theme.spacing(3),
    padddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
  menu: {
    paddingLeft: theme.spacing(1),
    height: '100%',
    overflowY: 'scroll',
  },
  input: {
    height: '2em',
    paddingTop: 0,
    paddingBottom: 0,
    fontSize: '1.2em'
  }
}))

const MenuItem: React.FC<{
  img: string,
  name: string
}> = ({
  img,
  name,
}) => {
  const classes = useStyles();
  return (
    <Grid item xs={6} sm={4} md={3}>
      <Card elevation={0} className={classes.card}>
        <div className={classes.scaler}>
          <CardMedia
            className={classes.img}
            image={img}
            title={img}
          />
        </div>
        <CardContent>
          <div className={classes.actionBar}>
            <Button
              size='small'
              variant='contained'
              className={classes.button}
            >
              <RemoveIcon />
            </Button>
            <TextField
              size='small'
              type='number'
              variant='filled'
              inputProps={{
                className: classes.input
              }}
            />
            <Button
              size='small'
              variant='contained'
              color='primary'
              className={classes.button}
            >
              <AddIcon />
            </Button>
          </div>
          <Typography gutterBottom variant='subtitle1'>
            {name.toUpperCase()}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  )
}

const PlanMenu: React.FC = () => {
  return (
    <Grid container>
      <MenuItem
        img='placeholderMeal.jpg'
        name='Rice Bowl'
      />
      <MenuItem
        img='placeholderMeal.jpg'
        name='Rice Bowl'
      />
      <MenuItem
        img='placeholderMeal.jpg'
        name='Rice Bowl'
      />
      <MenuItem
        img='placeholderMeal.jpg'
        name='Rice Bowl'
      />
      <MenuItem
        img='placeholderMeal.jpg'
        name='Rice Bowl'
      />
      <MenuItem
        img='placeholderMeal.jpg'
        name='Rice Bowl'
      />
      <MenuItem
        img='placeholderMeal.jpg'
        name='Rice Bowl'
      />
    </Grid>
  )
}

const RestMenu: React.FC<{
  name: string,
}> = ({
  name
}) => {
  const classes = useStyles();
  return (
    <>
      <Typography variant='h4' className={classes.restTitle}>
        {name}
      </Typography>
      <PlanMenu />
    </>
  )
}

const menu = () => {
  const classes = useStyles();
  return (
    <Container maxWidth='lg' disableGutters className={classes.container}>
      <Grid container alignItems='stretch' className={classes.gridContainer}>
        <Grid item xs={9} className={classes.menu}>
          <RestMenu name='Domo' />
          <RestMenu name='Bar and grille' />
          <RestMenu name='Kingstons' />
        </Grid>
        <Grid item xs={3} className={classes.cart}>
          <Typography variant='h4'>
            Your meals
          </Typography>
        </Grid>
      </Grid>
    </Container>
  )  
}

export default menu;

export const menuRoute = 'menu';