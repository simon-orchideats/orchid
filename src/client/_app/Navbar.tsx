import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import Link from 'next/link'
import { Container, Typography } from '@material-ui/core';
import { howItWorksRoute } from '../../pages/how-it-works';
import { plansRoute } from '../../pages/plans';
import { menuRoute } from '../../pages/menu';
import { indexRoute } from '../../pages';

const useStyles = makeStyles(theme => ({
  link: {
    maxWidth: 110,
    flex: 1,
    cursor: 'pointer',
  },
  account: {
    marginLeft: 'auto',
    marginRight: theme.spacing(1)
  },
  how: {
    marginRight: theme.spacing(1),
  },
  container: {
    padding: 0,
  },
  toolbar: {
    display: 'flex',
    padding: 0, 
  },
  logo: {
    [theme.breakpoints.down('xs')]: {
      width: 100,
      marginRight: theme.spacing(2)
    },
    width: 150,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: theme.spacing(1),
    marginRight: theme.spacing(5),
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
              <Typography variant='button' className={`${classes.link} ${classes.how}`}>How it works</Typography>
            </Link>
            <Link href={howItWorksRoute}>
              <AccountCircleIcon className={classes.account} />
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