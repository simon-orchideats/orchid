import { makeStyles, Container, Typography } from '@material-ui/core';
import Footer from '../client/general/Footer';

const useStyles = makeStyles(theme => ({
  title: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  container: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    // textAlign: 'center', 
    marginBottom: theme.spacing(4),
  },
  text: {
    fontSize: '1.25rem',
  },
  img: {
    width: '100%',
    maxWidth: 600,
    [theme.breakpoints.up('md')]: {
      paddingRight: theme.spacing(2)
    },
    paddingBottom: theme.spacing(2),
  },
}))

const about = () => {
  const classes = useStyles();
  return (
    <>
      <Container maxWidth='lg' className={classes.container}>
        <Typography variant='h4' className={classes.title}>
          About Us
        </Typography>
        <img src='/about/about.jpg' className={classes.img} />
        <Typography variant='body1' className={classes.text}>
          We’re a small local team from NYC and Jersey City on a mission to solve the problem of food apps overcharging
          both restaurants and customers. Our friends and family work in restaurants that are struggling to stay alive
          during the pandemic and cannot afford the 30% commission fees that apps charge to deliver their food. If that
          alone isn’t a crime, customers are getting ripped off with price markups and crazy fees. For what? A
          high-feature app with slightly faster delivery times and GPS tracking? Why are we paying 30% extra for food.
          Table is our mission to build a better way for everyone. 
        </Typography>
      </Container>
      <Footer />
    </>
  )
}

export default about;

export const aboutRoute = '/about';