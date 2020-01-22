import { Card, CardMedia, CardContent, Typography, makeStyles, Grid, TextField, Button, Container } from "@material-ui/core";
import AddIcon from '@material-ui/icons/add';
import RemoveIcon from '@material-ui/icons/remove';

const useStyles = makeStyles(theme => ({
  container: {
    background: 'none',
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
  },
  img: {
    position: 'absolute',
    width: '100%',
    height: '100%',
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
    <Container maxWidth='lg' className={classes.container}>
      <RestMenu name='Domo' />
      <RestMenu name='Bar and grille' />
      <RestMenu name='Kingstons' />
    </Container>
  )  
}

export default menu;

export const menuRoute = 'menu';