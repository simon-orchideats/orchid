import { Container, makeStyles, Typography, Button, ExpansionPanelSummary, ExpansionPanel, ExpansionPanelDetails } from "@material-ui/core";
import Faq from "../client/general/CommonQuestions";
import withClientApollo from "../client/utils/withClientApollo";
// import Link from "next/link";
import Router from 'next/router'
import { menuRoute } from "./menu";
import { isServer } from "../client/utils/isServer";
import { useGetCart, useSetScheduleAndAutoDeliveries } from "../client/global/state/cartState";
import DeliveryDateChooser from "../client/general/DeliveryDateChooser";
import { useState } from "react";
// import { DeliveryInput } from "../order/deliveryModel";
// import { checkoutRoute } from "./checkout";
import DeleteIcon from '@material-ui/icons/Delete';
import { Schedule } from "../consumer/consumerModel";
import ScheduleDeliveries from "../client/general/inputs/ScheduledDelivieries";

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
  addDelivery: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    color: theme.palette.warning.main,
  },
  addButton: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  deliveryCount: {
    paddingLeft: theme.spacing(2),
  },
  deliveryHeader: {
    display: 'flex',
    paddingBottom: theme.spacing(2),
    alignItems: 'center',
  },
  dates: {
    flexDirection: 'column',
  },
}));

const delivery = () => {
  const classes = useStyles();
  const cart = useGetCart();
  const [expanded, setExpanded] = useState<'deliveries' | 'assignments'>('deliveries');
  const [schedules, setSchedules] = useState<Schedule[]>([
    Schedule.getDefaultSchedule()
  ]);
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
    setScheduleAndAutoDeliveries(schedules);
    setExpanded('assignments');
  }
  if (!cart) {
    if (!isServer()) Router.replace(`${menuRoute}`);
    return null;
  }
  const remainingDeliveries = Math.floor(cart.getMealCount() / 4) - schedules.length;
  return (
    <>
      <Container className={classes.container}>
        <ExpansionPanel
          expanded={expanded === 'deliveries'}
          className={classes.panel}
          onChange={handleExpander('deliveries')}
        >
          <ExpansionPanelSummary>
            <Typography variant='h4' color='primary'>
              1. Choose dates
            </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={classes.dates}>
            {schedules.map((s, i) => (
              <>
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
              </>
            ))}
            {
              remainingDeliveries === 0 ?
              <Typography variant='body1' className={classes.addDelivery}>
                Max deliveries reached
              </Typography>
              :
              <>
                <Typography variant='body1' className={classes.addDelivery}>
                  {remainingDeliveries} extra {remainingDeliveries > 1 ? 'delivieries' : 'delivery'} remaining
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
            <Typography variant='h4' color='primary'>
              2. Schedule meals
            </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <ScheduleDeliveries deliveries={cart.Deliveries}/>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </Container>
      <Faq />
    </>
  )
}

export default withClientApollo(delivery);

export const deliveryRoute = '/delivery';