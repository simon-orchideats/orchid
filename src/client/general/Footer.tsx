import { makeStyles, Container, Typography, Paper, Grid, IconButton } from '@material-ui/core';
import Link from 'next/link'
import { privacyRoute } from '../../pages/privacy';
import { faqsRoute } from '../../pages/faq';
import { termsRoute } from '../../pages/terms';
import FacebookIcon from '@material-ui/icons/Facebook';
import InstagramIcon from '@material-ui/icons/Instagram';
import { plansRoute } from '../../pages/plans';
import { menuRoute } from '../../pages/menu';
import { howItWorksRoute } from '../../pages/how-it-works';

const useStyles = makeStyles(theme => ({
  paper: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  link: {
    cursor: 'pointer',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
  },
  column: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  logo: {
    width: 110,
  },
}))

const Footer = () => {
  const classes = useStyles();
  const onClickFb = () => {
    window.location.href = 'https://www.facebook.com/orchidFB'
  }
  const onClickIg = () => {
    window.location.href = 'https://www.instagram.com/orchidIG'
  }
  return (
    <Paper elevation={0} className={classes.paper}>
      <Container maxWidth='lg'>
        <Grid container>
          <Grid
            item
            xs={6}
            sm={3}
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
          <Grid item sm={1} />
          <Grid
            item
            xs={6}
            sm={2}
            className={classes.column}
          >
            <Link href={menuRoute}>
              <Typography
                variant='button'
                className={classes.link}
              >
                Menu
              </Typography>
            </Link>
            <Link href={howItWorksRoute}>
              <Typography
                variant='button'
                className={classes.link}
              >
                How it works
              </Typography>
            </Link>
            <Link href={plansRoute}>
              <Typography
                variant='button'
                className={classes.link}
              >
                Plans
              </Typography>
            </Link>
            <Link href={faqsRoute}>
              <Typography
                variant='button'
                className={classes.link}
              >
                FAQ
              </Typography>
            </Link>
          </Grid>
          <Grid item sm={1} />
          <Grid
            item
            xs={6}
            sm={2}
            className={classes.column}
          >
            <Link href={privacyRoute}>
              <Typography
                variant='button'
                className={classes.link}
              >
                Privacy
              </Typography>
            </Link>
            <Link href={termsRoute}>
              <Typography
                variant='button'
                className={classes.link}
              >
                Terms
              </Typography>
            </Link>
          </Grid>
          <Grid item sm={1} />
          <Grid
            item
            xs={6}
            sm={2}
            className={classes.item}
          >
            <div className={classes.item}>
              <IconButton onClick={onClickFb}>
                <FacebookIcon />
              </IconButton>
              <IconButton onClick={onClickIg}>
                <InstagramIcon />
              </IconButton>
            </div>
          </Grid>
        </Grid>
      </Container>
    </Paper>
  )
}

export default Footer;
