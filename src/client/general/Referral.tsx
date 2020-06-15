import { makeStyles, Typography, Grid, useMediaQuery, Theme, useTheme, Paper } from '@material-ui/core';
import withClientApollo from '../utils/withClientApollo';
import React from 'react';
import { useGetConsumer } from '../../consumer/consumerService';
import { referralFriendAmount, referralSelfAmount, referralMonthDuration } from '../../order/promoModel';
import { activeConfig } from '../../config';
import WithClickToCopy from '../general/WithClickToCopy';
import RedeemRoundedIcon from '@material-ui/icons/RedeemRounded';

const selfAmount = referralSelfAmount * 4 * referralMonthDuration / 100;
const friendAmount = referralFriendAmount * 4 * referralMonthDuration / 100;

const useStyles = makeStyles(theme => ({
  centered: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  redeem: {
    height: 0,
  },
  round: {
    position: 'absolute',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.palette.common.white,
    height: 125,
    width: 125,
    borderRadius: 100,
    borderWidth: 5,
    borderColor: theme.palette.primary.main,
    borderStyle: 'solid',
    [theme.breakpoints.down('xs')]: {
      height: 100,
      width: 100,
    },
  },
  icon: {
    [theme.breakpoints.down('xs')]: {
      fontSize: '3.5rem'
    },
    fontSize: '5rem',
  },
  row: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    textAlign: 'left',
  },
  friends: {
    background: 'url(/home/friends.png)',
    backgroundSize: 'cover',
    height: '40vh',
    backgroundPosition: '50% 50%',
    marginTop: -theme.mixins.navbar.marginBottom,
    borderColor: theme.palette.primary.main,
    borderBottomWidth: 5,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderStyle: 'solid'
  },
  welcomeTitle: {
    fontWeight: 600,
    backgroundColor: theme.palette.common.white,
    padding: 16,
    borderRadius: 40,
    paddingLeft: 24,
    paddingRight: 24,
  },
  topMargin: {
    marginTop: theme.spacing(1),
  },
  link: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  largeBottomMargin: {
    marginBottom: theme.spacing(4),
  },
  largeVerticalMargin: {
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5),
  },
  description: {
    backgroundColor: theme.palette.common.white,
    display: 'flex',
    justifyContent: 'center',
    minHeight: 400,
    paddingTop: theme.spacing(8),
    [theme.breakpoints.down('xs')]: {
      paddingTop: theme.spacing(9),
    },
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  subtitle: {
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.65rem'
    },
  },
  shrinker: {
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.85rem',
    },
  },
  title: {
    paddingBottom: theme.spacing(3)
  },
  referralText: {
    backgroundColor: theme.palette.common.white,
    padding: theme.spacing(4),
  },
  box: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2),
    borderWidth: 2,
    borderColor: theme.palette.common.black,
    maxWidth: 300,
    minHeight: 132,
  },
}));

const Header = () => {
  const classes = useStyles();
  const theme = useTheme<Theme>();
  const isSmAndDown = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <div className={`${classes.friends} ${classes.centered}`}>
      <Typography variant={isSmAndDown ? 'h3' : 'h2'} className={classes.welcomeTitle}>
        Gift ${friendAmount}, Get ${selfAmount}
      </Typography>
    </div>
  );
};

const Redeem = () => {
  const classes = useStyles();
  return (
    <div className={`${classes.centered} ${classes.redeem}`}>
      <div className={classes.round}>
        <RedeemRoundedIcon className={classes.icon} />
      </div>
    </div>
  )
}

const Description = withClientApollo(() => {
  const classes = useStyles();
  const consumer = useGetConsumer();
  const consumerData = consumer.data;
  const referralLink = consumerData && consumerData.Plan &&
    `${activeConfig.client.app.url.replace('https://', '')}?p=${consumerData.Plan.ReferralCode}&a=${referralFriendAmount}`
  const width = referralLink ? 4 : 3;
  return (
    <div className={`${classes.description} ${classes.centered}`}>
      <Typography variant='h3' className={`${classes.largeBottomMargin} ${classes.shrinker}`}>
        Get ${selfAmount} when you refer a friend&nbsp;
        {
          referralLink &&
          <WithClickToCopy
            render={onCopy => 
              <div className={classes.link} onClick={() => onCopy(referralLink)}>
                <b>
                  {referralLink}
                </b>
              </div>
            }
          />
        }
      </Typography>
      <Typography variant='h3' className={`${classes.title} ${classes.shrinker}`}>
        How to Earn
      </Typography>
      <Grid
        justify='center'
        container
        spacing={2}
      >
        {
          !referralLink &&
          <Grid
            item
            className={classes.centered}
            xl={3}
            md={width}
            sm={12}
          >
            <Paper
              variant='outlined'
              elevation={0}
              className={classes.box}
            >
              <Typography variant='h6'>
                Subscribe to get your referral link
              </Typography>
            </Paper>
          </Grid>
        }
        <Grid
          item
          className={classes.centered}
          xl={width}
          md={width}
          sm={12}
        >
          <Paper
            variant='outlined'
            elevation={0}
            className={classes.box}
          >
            <Typography variant='h6'>
              Your friend checkouts with your link
            </Typography>
          </Paper>
        </Grid>
        <Grid
          item
          className={classes.centered}
          xl={width}
          md={width}
          sm={12}
        >
          <Paper
            variant='outlined'
            elevation={0}
            className={classes.box}
          >
            <Typography variant='h6'>
              They get ${friendAmount} over 4 weeks
            </Typography>
          </Paper>
        </Grid>
        <Grid
          item
          className={classes.centered}
          xl={width}
          md={width}
          sm={12}
        >
          <Paper
            variant='outlined'
            elevation={0}
            className={classes.box}
          >
            <Typography variant='h6'>
              You earn ${selfAmount} over 4 weeks
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
});

const Referral = () => {
  return (
    <>
      <Header />
      <Redeem />
      <Description />
    </>
  )
}

export default Referral;
