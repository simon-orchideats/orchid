
import { makeStyles, Typography, Container, Paper, Button} from "@material-ui/core";
import { useState, useRef } from 'react';
import { CuisineType, RenewalType,RenewalTypes, deliveryDay } from '../../consumer/consumerModel';
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
  verticalPadding: {
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(2),
  },
  cancel: {
    marginTop: theme.spacing(3),
  },
}));

const myPlan = () => {
  const classes = useStyles();
  const [renewal, setRenewal] = useState<RenewalType>(RenewalTypes.Skip)
  const [cuisines, setCuisines] = useState<CuisineType[]>([]);
  const [day, setDay] = useState<deliveryDay>(0);
  const validateCuisineRef= useRef<() => boolean>();
  return (
    <Container maxWidth='lg' className={classes.container}>
      <Typography variant='h3'>
        My plan
      </Typography>
      <Paper className={classes.paperContainer}>
        <Typography
          variant='h6'
          color='primary'
          className={classes.verticalPadding}
        >
          Preferred meal plan
        </Typography>
        <PlanCards isSelectable={true}/>
        <Typography
          variant='h6'
          color='primary'
          className={classes.verticalPadding}
        >
          Preferred delivery day
        </Typography>
        <DeliveryDateChooser day={day} onDayChange={day => setDay(day)}/>
        <Typography
          variant='h6'
          color='primary'
          className={classes.verticalPadding}
        >
          Next Week
        </Typography>
        <RenewalChooser 
          renewal={renewal}
          cuisines={cuisines}
          onCuisineChange={cuisines => setCuisines(cuisines)}
          onRenewalChange={renewal => setRenewal(renewal)}
          validateCuisineRef={validateCuisine => {
            validateCuisineRef.current = validateCuisine;
          }}
        />
        <Button variant='outlined' className={classes.cancel}>
          Cancel subscription
        </Button>
      </Paper>
    </Container>
  );
}

export default myPlan; 

export const myPlanRoute = '/consumer/my-plan';