import { Container, makeStyles, Typography, Button, ExpansionPanelSummary, ExpansionPanel, ExpansionPanelDetails } from "@material-ui/core";
import Faq from "../client/general/CommonQuestions";
import withClientApollo from "../client/utils/withClientApollo";
import Router from 'next/router'
import { menuRoute } from "./menu";
import { isServer } from "../client/utils/isServer";
import { useGetCart, useSetScheduleAndAutoDeliveries } from "../client/global/state/cartState";
import { useState, useMemo } from "react";
import { Schedule, deliveryDay, deliveryTime } from "../consumer/consumerModel";
import ScheduleDeliveries from "../client/general/inputs/ScheduledDelivieries";
import { MIN_MEALS } from "../plan/planModel";
import Link from "next/link";
import { checkoutRoute } from "./checkout";
import { Cart } from "../order/cartModel";
import PreferredSchedule from "../client/general/PreferredSchedule";

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'none',
    paddingBottom: theme.spacing(4),
  },
  panel: {
    width: '100%'
  },
  nextButton: {
    marginTop: theme.spacing(1),
  },
  col: {
    flexDirection: 'column',
  },
}));

const delivery = () => {
  const classes = useStyles();
  const cart = useGetCart();
  const [expanded, setExpanded] = useState<'deliveries' | 'assignments'>('deliveries');
  const [schedules, setSchedules] = useState<Schedule[]>(
    cart && cart.Schedules.length > 0 ? cart.Schedules : [ Schedule.getDefaultSchedule() ]
  );
  const [hasScheduleError, setHasScheduleError] = useState<boolean>(false);
  const setScheduleAndAutoDeliveries = useSetScheduleAndAutoDeliveries();
  const updateSchedules = (i: number, day: deliveryDay, time: deliveryTime) => {
    const newSchedules = schedules.map(s => new Schedule(s));
    newSchedules[i] = new Schedule({
      day,
      time,
    });
    setSchedules(newSchedules);
  }
  const addSchedule = () => {
    const newSchedules = schedules.map(s => new Schedule(s));
    newSchedules.push(Schedule.getDefaultSchedule());
    setSchedules(newSchedules);
  }
  const removeSchedule = (i: number) => {
    const newSchedules = schedules.map(s => new Schedule(s));
    newSchedules.splice(i, 1);
    setSchedules(newSchedules);
  }
  const handleExpander = (panel: 'deliveries' | 'assignments') => (_event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    if (isExpanded) setExpanded(panel);
  };
  const setDates = () => {
    setScheduleAndAutoDeliveries(schedules);
    setExpanded('assignments');
  }
  if (!cart) {
    if (!isServer()) Router.replace(`${menuRoute}`);
    return null;
  }
  const allowedDeliveries = useMemo(() => 
    Math.max(
      Object.values(cart.RestMeals).reduce(
        (sum, restMeal) => sum + Math.floor(Cart.getRestMealCount(restMeal.mealPlans) / MIN_MEALS),
        0
      ),
      1
    ),
    []
  );
  if (schedules.length > allowedDeliveries) {
    const newSchedules = schedules.map(s => new Schedule(s));
    const removeCount = schedules.length - allowedDeliveries;
    newSchedules.splice(newSchedules.length - removeCount);
    setSchedules(newSchedules);
  }
  return (
    <>
      <Container className={classes.container}>
        <ExpansionPanel
          expanded={expanded === 'deliveries'}
          className={classes.panel}
          onChange={handleExpander('deliveries')}
        >
          <ExpansionPanelSummary>
            <div>
              <Typography variant='h4' color='primary'>
                1. Choose preferred repeat delivery dates
              </Typography>
              <Typography variant='body1' color='textSecondary'>
                Orchid will deliver meals at these times each week
              </Typography>
            </div>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={classes.col}>
            <PreferredSchedule
              addSchedule={addSchedule}
              allowedDeliveries={allowedDeliveries}
              removeSchedule={removeSchedule}
              schedules={schedules}
              updateSchedule={updateSchedules}
            />
            <Button
              variant='contained'
              color='primary'
              fullWidth
              onClick={setDates}
              className={classes.nextButton}
            >
              Next
            </Button>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel
          expanded={expanded === 'assignments'} 
          className={classes.panel}
          onChange={handleExpander('assignments')}
        >
          <ExpansionPanelSummary>
            <div>
              <Typography variant='h4' color='primary'>
                2. Schedule meals for the first week
              </Typography>
              <Typography variant='body1' color='textSecondary'>
                Orchid will automatically pick <i>next week's</i> meals based on your schedule. You can
                always edit 2 days prior to your delivery.
              </Typography>
            </div>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={classes.col}>
            <ScheduleDeliveries
              deliveries={cart.Deliveries}
              setError={setHasScheduleError}
              movable
            />
            <Link href={checkoutRoute}>
              <Button
                variant='contained'
                color='primary'
                fullWidth
                className={classes.nextButton}
                disabled={hasScheduleError}
              >
                Next
              </Button>
            </Link>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </Container>
      <Faq />
    </>
  )
}

export default withClientApollo(delivery);

export const deliveryRoute = '/delivery';