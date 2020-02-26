
import { makeStyles, Typography, Container, Paper} from "@material-ui/core";
import { useState } from 'react';
import { CuisineType, RenewalType, RenewalTypes, deliveryDay } from '../../consumer/consumerModel';
import PlanCards from '../../client/plan/PlanCards';
import RenewalChooser from '../../client/general/RenewalChooser';
import DeliveryDateChooser from '../../client/general/DeliveryDateChooser';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
    background: 'none',
    paddingBottom: theme.spacing(4),
  },
  paperContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
    marginTop: theme.spacing(3),
    paddingBottom: theme.spacing(4),
   
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },

  header: {
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(2),
  },
}));

const myPlan = () => {
  const classes = useStyles();
  const [selectedRenewal, setSelectedRenewal] = useState<RenewalType>(RenewalTypes.Skip)
  const [selectedCuisines, setSelectedCuisines] = useState<CuisineType[]>([]);
  const [selectedcuisinesError, setSelectedCuisinesError] = useState<string>('');
  const cuisineProps = {selectedCuisines, setSelectedCuisines, selectedRenewal, setSelectedRenewal, selectedcuisinesError, setSelectedCuisinesError};
  const [day, setDay] = useState<deliveryDay>(0);
  const onDayChange = (day:deliveryDay) => {
    setDay(day);
  }
  return (
    <Container maxWidth='lg' className={classes.container}>
      <Typography variant='h3'>
        My plan
      </Typography>
      <Paper className={classes.paperContainer}>
        <Typography
          variant='h6'
          color='primary'
          className={classes.header}
        >
          Preferred meal plan
        </Typography>
        <PlanCards isSelectable={true}/>
        <Typography
          variant='h6'
          color='primary'
          className={classes.header}
        >
          Preferred delivery day
        </Typography>
        <DeliveryDateChooser day={day} onDayChange={onDayChange}/>
        <Typography
          variant='h6'
          color='primary'
          className={classes.header}
        >
          Next Week
        </Typography>
        <RenewalChooser {...cuisineProps} autoSave={true}/>
      </Paper>
    </Container>
  );
}

export default myPlan; 

export const myPlanRoute = '/consumer/my-plan';