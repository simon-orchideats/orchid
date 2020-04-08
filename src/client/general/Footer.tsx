import { makeStyles, Container, Typography, Paper, Grid } from '@material-ui/core';
import Link from 'next/link'
import { privacyRoute } from '../../pages/privacy';
import { faqsRoute } from '../../pages/faqs';
import { termsRoute } from '../../pages/terms';

const useStyles = makeStyles(theme => ({
  paper: {
    textAlign: 'center',
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  link: {
    cursor: 'pointer',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 110,
  },
}))

const Footer = () => {
  const classes = useStyles();
  return (
    <Paper elevation={0} className={classes.paper}>
      <Container maxWidth='lg'>
        <Grid container>
          <Grid
            item
            xs={3}
            className={classes.item}
          >
            <div>
              <img
                src='/logo.png'
                alt='logo'
                className={classes.logo}
              />
              <Typography variant='body1'>
                © foodflick inc.
              </Typography>
            </div>
          </Grid>
          <Grid
            item
            xs={3}
            className={classes.item}
          >
            <Link href={privacyRoute}>
              <Typography
                variant='button'
                className={classes.link}
              >
                Privacy
              </Typography>
            </Link>
          </Grid>
          <Grid
            item
            xs={3}
            className={classes.item}
          >
            <Link href={termsRoute}>
              <Typography
                variant='button'
                className={classes.link}
              >
                Terms
              </Typography>
            </Link>
          </Grid>
          <Grid
            item
            xs={3}
            className={classes.item}
          > 
            <Link href={faqsRoute}>
              <Typography
                variant='button'
                className={classes.link}
              >
                FAQ
              </Typography>
            </Link>
          </Grid>
        </Grid>
      </Container>
    </Paper>
  )
}

export default Footer;
