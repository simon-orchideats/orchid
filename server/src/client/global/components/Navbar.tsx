import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Link from 'next/link'
import { Container, Typography } from '@material-ui/core';
import { howItWorksRoute } from '../../../pages/how-it-works';
import { plansRoute } from '../../../pages/plans';
import { menuRoute } from '../../../pages/menu';
import { indexRoute } from '../../../pages';

const useStyles = makeStyles(theme => ({
  link: {
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(5),
    cursor: 'pointer',
  },
  container: {
    padding: 0,
  },
  toolbar: {
    padding: 0, 
  },
  logo: {
    width: 200,
    paddingRight: theme.spacing(5),
    cursor: 'pointer',
  },
  spacer: {
    height: theme.mixins.navbar.marginBottom,
    backgroundColor: theme.palette.background.default,
  },
}));

const Navbar: React.FC = () => {
  const classes = useStyles();
  return (
    <>
      <AppBar position='sticky' color='default'>
        <Container className={classes.container} maxWidth='lg'>
          <Toolbar className={classes.toolbar}>
            <Link href={indexRoute}>
              <img src='/logo.png' alt='logo' className={classes.logo} />
            </Link>
            <Link href={plansRoute}>
              <Typography variant='button' className={classes.link}>Plans</Typography>
            </Link>
            <Link href={menuRoute}>
              <Typography variant='button' className={classes.link}>Menu</Typography>
            </Link>
            <Link href={howItWorksRoute}>
              <Typography variant='button' className={classes.link}>How it works</Typography>
            </Link>
          </Toolbar>
        </Container>
      </AppBar>
      {/* empty child to satisfying children prop warning */}
      <Container maxWidth='lg' className={classes.spacer}><></></Container>
    </>
  );
}

export default Navbar;