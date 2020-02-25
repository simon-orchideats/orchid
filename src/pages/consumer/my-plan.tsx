
import { makeStyles, Typography, Container, Paper} from "@material-ui/core";
// import requireAuth from "../../client/utils/auth/requireAuth";
import { useState } from 'react';
import { CuisineType, RenewalType, RenewalTypes } from '../../consumer/consumerModel';
import withClientApollo from "../../client/utils/withClientApollo";



import PlanCards from '../../client/plan/PlanCards';
// import { useNotify } from "../../client/global/state/notificationState";
import NextWeek from '../../client/general/NextWeek';
import DeliveryDay from '../../client/general/DeliveryDate';
import Notifier from "../../client/notification/Notifier";

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
    paddingBottom: theme.spacing(4),
    paddingTop: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
  toggleButtonGroup: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  input: {
    alignSelf: 'stretch',
  },
  smallPaddingBottom: {
    paddingBottom: theme.spacing(2),
  },
  row: {
    display: 'flex',
  },
  header: {
    paddingBottom: theme.spacing(4),
  },
}));

const myPlan = () => {

  const classes = useStyles();
  const [selectedRenewal, setSelectedRenewal] = useState<RenewalType>(RenewalTypes.Skip)
  const [selectedCuisines, setSelectedCuisines] = useState<CuisineType[]>([]);
  const [selectedcuisinesError, setSelectedCuisinesError] = useState<string>('');

  const cuisineProps = {selectedCuisines, setSelectedCuisines, selectedRenewal, setSelectedRenewal, selectedcuisinesError, setSelectedCuisinesError};
  const autoSave={autoSave:true};
  return (
    <Container maxWidth='xl' className={classes.container}>
       <Typography
          variant='h6'
          color='primary'
          className={classes.header}
        >
         My plan
        </Typography>
       <Notifier />
       <Paper className={classes.paperContainer}>
       <Typography
          variant='h6'
          color='primary'
          className={classes.header}
        >
         Preferred meal plan
        </Typography>
     <PlanCards isClickable={true}/>
      <Typography
          variant='h6'
          color='primary'
          className={classes.header}
        >
         Preferred delivery day
        </Typography>
        <DeliveryDay {...autoSave}/>
        <NextWeek {...{...cuisineProps,...autoSave}}/>
        </Paper>
    </Container>
  );
}

export default withClientApollo(myPlan); 

export const myPlanRoute = '/consumer/my-plan';