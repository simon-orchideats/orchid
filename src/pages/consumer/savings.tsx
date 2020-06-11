//@ts-nocheck
import { makeStyles, Typography, Container, Paper, Grid } from "@material-ui/core";
import withApollo from "../../client/utils/withPageApollo"
import { useRequireConsumer } from "../../consumer/consumerService";
import { useGetRewards, useGetSpent } from "../../client/order/orderService";
import CountUp from 'react-countup';
import {
  PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
} from 'recharts';

const savingsColor = '#008036'

const useStyles = makeStyles(theme => ({
  container: {
    background: 'none'
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 24,
    paddingLeft: 32,
    paddingRight: 32,
    paddingBottom: 32,
  },
  description: {
    paddingTop: theme.spacing(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  graphContainer: {
    display: 'flex',
    justifyContent: 'center'
  },
  sectionHeader: {
    alignSelf: 'flex-start',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  totalSavings: {
    alignSelf: 'flex-start',
    paddingTop: theme.spacing(2),
  },
  assumption: {
    alignSelf: 'flex-start',
    paddingBottom: theme.spacing(2),
  },
  marginTop: {
    marginTop: theme.spacing(4)
  },
  savings: {
    color: savingsColor,
  },
  label: {
    fill: theme.palette.text.primary,
  },
}));

const Referrals = () => {
  const classes = useStyles();
  const rewardsRes = useGetRewards();
  const renderCustomizedLabel = ({ amount, ...rest }: any) => (
    <text {...rest} className={classes.label}>
      {`$${amount.toFixed(0)}`}
    </text>
  );
  // const earned = rewardsRes.data?.Earned ? rewardsRes.data.Earned / 100 : 0;
  // const potential = earned + (rewardsRes.data?.Potential ? rewardsRes.data?.Potential / 100 : 0);

  const earned = 25;
  const potential = 100;
  const data = [
    {
      name: 'Earned',
      amount: earned,
      fill: savingsColor,
    },
    {
      name: 'Upcoming earnings',
      amount: potential,
      fill: '#f6fbfc',
    },
  ]
  const doesNotNeedPie = earned === 0 && potential === 0;
  return (
    <Paper className={classes.paper}>
    <Typography
      variant='h4'
      color='primary'
      className={classes.totalSavings}
    >
      Earnings from referrals
    </Typography>
    <Typography
      variant='body1'
      color='textSecondary'
      className={classes.assumption}
    >
      Referring a friend earns you $5 over 4 weeks
    </Typography>
      <Grid 
        spacing={2}
        container 
        className={classes.description}
      >
        {
          doesNotNeedPie ?
            null
          :
            <Grid
              className={classes.graphContainer}
              item
              md={4}
              sm={12}
            >
              <PieChart width={300} height={200}>
                <Pie
                  nameKey='name'
                  dataKey='amount'
                  startAngle={180}
                  endAngle={0}
                  data={data}
                  cy={150}
                  outerRadius={100}
                  innerRadius={75}
                  labelLine={false}
                  label={renderCustomizedLabel}
                />
                <Legend
                  iconSize={10}
                  verticalAlign='bottom'
                  align="center"
                />
              </PieChart>
            </Grid>
        }
        <Grid
          item
          className={`${classes.marginTop} ${classes.savings}`}
          md={doesNotNeedPie ? 6 : 4}
          sm={12}
        >
          <CountUp
            prefix='$'
            decimals={2}
            start={0}
            end={earned}
            delay={0}
          >
            {
              ({ countUpRef }) => 
                <Typography
                  variant='h4'
                  align='center'
                  ref={countUpRef}
                />
            }
          </CountUp>
          <Typography variant='h5' align='center'>
            You Earned
          </Typography>
        </Grid>
        <Grid
          className={classes.marginTop}
          item
          md={doesNotNeedPie ? 6 : 4}
          sm={12}
        >
          <CountUp
            prefix='$'
            decimals={2}
            start={0}
            end={potential}
            delay={0}
          >
            {
              ({ countUpRef }) => 
                <Typography
                  variant='h4'
                  align='center'
                  ref={countUpRef}
                />
            }
          </CountUp>
          <Typography variant='h5' align='center'>
            Upcoming earnings
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}

const TotalSavings = () => {
  const classes = useStyles();
  const spentRes = useGetSpent();
  const spentAmount = spentRes.data?.Amount ? spentRes.data.Amount / 100 : 0;
  const numMeals = spentRes.data?.NumMeals ?? 0;
  const numOrders = spentRes.data?.NumOrders ?? 0;
  const lifetimeSavings = (16 * numMeals) - (spentAmount);
  const data = [
    {
      name: 'Lifetime savings',
      amount: lifetimeSavings.toFixed(2),
    },
  ]
  return (
    <Paper className={classes.paper}>
      <Typography
        variant='h4'
        color='primary'
        className={classes.totalSavings}
      >
        Total savings vs on-demand apps
      </Typography>
      <Typography
        variant='body1'
        color='textSecondary'
        className={classes.assumption}
      >
        Compared to $16 per meal after fees
      </Typography>
      <Grid
        container
        spacing={2}
        className={classes.description}
      >
        <Grid
          item
          md={4}
          sm={12}
          className={classes.graphContainer}
        >
          <BarChart
            width={250}
            height={300}
            data={data}
            margin={{ right: 50, bottom: 0, top: 0, left: 0 }}
          >
            <XAxis dataKey='name' />
            <YAxis 
              tickFormatter={tick => `$${tick}`}
              domain={[ 'dataMin', 'dataMax + 50' ]}
            />
            <Tooltip />
            <Bar
              label={{ position: 'top' }}
              dataKey='amount'
              stackId='a'
              fill={savingsColor}
            />
          </BarChart>
        </Grid>
        <Grid
          className={`${classes.marginTop} ${classes.savings}`}
          item
          md={4}
          sm={12}
        >
          <CountUp
            prefix='$'
            decimals={2}
            start={0}
            end={lifetimeSavings}
            delay={0}
          >
            {
              ({ countUpRef }) => 
                <Typography
                  variant='h4'
                  align='center'
                  ref={countUpRef}
                />
            }
          </CountUp>
          <Typography variant='h5' align='center'>
            Lifetime savings
          </Typography>
        </Grid>
        <Grid
          className={classes.marginTop}
          item
          md={4}
          sm={12}
        >
          <CountUp
            start={0}
            end={numOrders}
            delay={0}
          >
            {
              ({ countUpRef }) => 
                <Typography
                  variant='h4'
                  align='center'
                  ref={countUpRef}
                />
            }
          </CountUp>
          <Typography variant='h5' align='center'>
            Free deliveries received
          </Typography>
        </Grid>
      </Grid>
     </Paper>
  );
}

const Savings = () => {
  const classes = useStyles();
  const rewardsRes = useGetRewards();
  const consumer = useRequireConsumer(savingsRoute);
  const consumerData = consumer.data;
  if (!consumerData && !consumer.loading && !consumer.error) {
    return <Typography>Logging you in...</Typography>
  }
  if (rewardsRes.loading) {
    return <Typography variant='body1'>Loading...</Typography>
  }
  if (!consumerData) {
    if (consumer.loading) return <Typography>Loading...</Typography>
    console.error('No consumer data', consumer.error);
    return <Typography>Error</Typography>
  }
  return (
    <Container maxWidth='xl' className={classes.container}>
      <Typography variant='h3'>
        My Savings
      </Typography>
      <Referrals />
      <TotalSavings />
    </Container>
  );
}

export default withApollo(Savings);

export const savingsRoute = '/consumer/savings';