import { makeStyles, Container, Typography, Paper, Grid } from '@material-ui/core';
import Link from 'next/link'
import { privacyRoute } from '../../pages/privacy';

const useStyles = makeStyles(theme => ({
  paper: {
    textAlign: 'center',
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  link: {
    cursor: 'pointer',
  },
}))

const Footer = () => {
  const classes = useStyles();
  return (
    <Paper elevation={0} className={classes.paper}>
      <Container maxWidth='lg'>
        <Grid container>
          <Grid item xs={4}>
            <Link href={privacyRoute}>
              <Typography
                variant='button'
                className={classes.link}
              >
                Privacy
              </Typography>
            </Link>
          </Grid>
          <Grid item xs={4}>
            <Link href={privacyRoute}>
              <Typography
                variant='button'
                className={classes.link}
              >
                Terms
              </Typography>
            </Link>
          </Grid>
          <Grid item xs={4}>
            <Link href={privacyRoute}>
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
