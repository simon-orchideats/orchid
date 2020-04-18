import { Container, makeStyles, Typography, Button, ExpansionPanelSummary, ExpansionPanel, ExpansionPanelDetails } from "@material-ui/core";
import Faq from "../client/general/CommonQuestions";
import withClientApollo from "../client/utils/withClientApollo";
import Router from 'next/router'
import { menuRoute } from "./menu";
import { isServer } from "../client/utils/isServer";
import { useGetCart, useSetScheduleAndAutoDeliveries } from "../client/global/state/cartState";
import DeliveryDateChooser from "../client/general/DeliveryDateChooser";
import { useState, useMemo } from "react";
import DeleteIcon from '@material-ui/icons/Delete';
import { Schedule } from "../consumer/consumerModel";
import ScheduleDeliveries from "../client/general/inputs/ScheduledDelivieries";
import { MIN_MEALS } from "../plan/planModel";
import Link from "next/link";
import { checkoutRoute } from "./checkout";
import { Cart } from "../order/cartModel";

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
  addButton: {
    marginTop: theme.spacing(1),
  },
  nextButton: {
    marginTop: theme.spacing(1),
  },
  deliveryCount: {
    paddingLeft: theme.spacing(2),
  },
  deliveryHeader: {
    display: 'flex',
    paddingBottom: theme.spacing(2),
    alignItems: 'center',
  },
  col: {
    flexDirection: 'column',
  },
  scheduleDeliveries: {
    minHeight: 600,
    maxHeight: 800,
    overflow: 'scroll',
    display: 'flex',
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
  const updateDeliveries = (s: Schedule, i: number) => {
    const newSchedules = schedules.map(s => new Schedule(s));
    newSchedules[i] = s;
    setSchedules(newSchedules);
  }
  const addDelivery = () => {
    const newSchedules = schedules.map(s => new Schedule(s));
    newSchedules.push(Schedule.getDefaultSchedule());
    setSchedules(newSchedules);
  }
  const removeDelivery = (i: number) => {
    const newSchedules = schedules.map(s => new Schedule(s));
    newSchedules.splice(i, 1);
    setSchedules(newSchedules);
  }
  const handleExpander = (panel: 'deliveries' | 'assignments') => (_event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    if (isExpanded) setExpanded(panel);
  };
  const setDates = () => {
    if (cart && !Schedule.equalsLists(schedules, cart.Schedules)) {
      setScheduleAndAutoDeliveries(schedules);
    }
    setExpanded('assignments');
  }
  if (!cart) {
    if (!isServer()) Router.replace(`${menuRoute}`);
    return null;
  }
  const allowedDeliveries = useMemo(() => 
    Object.values(cart.RestMeals).reduce(
      (sum, restMeal) => sum + Math.floor(Cart.getRestMealCount(restMeal.mealPlans) / MIN_MEALS),
      0
    ),
    []
  );
  const remainingDeliveries = allowedDeliveries - schedules.length;
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
            {schedules.map((s, i) => (
              <div key={i}>
                <div className={classes.deliveryHeader}>
                  <DeleteIcon onClick={() => removeDelivery(i)} />
                  <Typography variant='h5' className={classes.deliveryCount}>
                    Delivery {i + 1}
                  </Typography>
                </div>
                <DeliveryDateChooser
                  day={s.Day}
                  onDayChange={day => updateDeliveries(
                    new Schedule({
                      ...s,
                      day,
                    }),
                    i
                  )}
                  time={s.Time}
                  onTimeChange={time => updateDeliveries(
                    new Schedule({
                      ...s,
                      time,
                    }),
                    i
                  )}
                />
              </div>
            ))}
            {
              remainingDeliveries === 0 ?
                allowedDeliveries > 1 &&
                <Typography variant='body1'>
                  *Max deliveries reached
                </Typography>
              :
              <>
                <Typography variant='body1' color='textSecondary'>
                  * {remainingDeliveries} extra {remainingDeliveries > 1 ? 'delivieries' : 'delivery'} remaining
                </Typography>
                <Typography variant='body1' color='textSecondary'>
                  (1 delivery for every {MIN_MEALS} meals from the <i>same</i> restaurant)
                </Typography>
                <Button
                  variant='outlined'
                  color='primary'
                  fullWidth
                  onClick={addDelivery}
                  className={classes.addButton}
                >
                  Add a delivery
                </Button>
              </>
            }
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
              onMove={hasError => setHasScheduleError(hasError)}
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