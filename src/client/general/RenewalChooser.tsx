
import { RenewalTypes, RenewalType, CuisineTypes, CuisineType } from "../../consumer/consumerModel";
import { Typography, makeStyles, Grid, Button } from "@material-ui/core";
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { useState, useEffect} from "react";

const useStyles = makeStyles(theme => ({
  toggleButtonGroup: {
    width: '100%',
  },
  title: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  subtitle: {
    marginTop: -theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}));
interface nextWeekProps {
  selectedRenewal:RenewalType,
  setSelectedRenewal:(value:RenewalType | ((arg1: RenewalType) => RenewalType)) => void,
  selectedCuisinesError?:string,
  setSelectedCuisines: (value:CuisineType[] | ((arg1: CuisineType[]) => CuisineType[])) => void,
  setSelectedCuisinesError:(value:string | ((arg1: string) => string)) => void,
  autoSave:boolean
}
const RenewalChooser = (props:nextWeekProps) => {
  const [renewal, setRenewal] = useState<RenewalType>(RenewalTypes.Skip);
  const [cuisinesError, setCuisinesError] = useState<string>('');
  useEffect( () => {
    if(props.autoSave===true) setCuisinesError('Please pick 1 type of cuisine');
  },[])
  const [cuisines, setCuisines] = useState<CuisineType[]>([]);
  const classes = useStyles();
  return (
    <>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant='subtitle2' className={classes.subtitle}>
            How do you want to handle meals for next week?
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <ToggleButtonGroup
            className={classes.toggleButtonGroup}
            size='small'
            exclusive
            value={renewal}
            onChange={(_, rt: RenewalType) => {
              // rt === null when selecting button
              if (rt === null) return;
              setRenewal(rt)
              
              props.setSelectedRenewal(rt)
              if (props.autoSave && cuisines.length === 0 && renewal === RenewalTypes.Auto) 
                {
                  setCuisinesError('Your picks are incomplete');
                }
            }}
          >
            <ToggleButton value={RenewalTypes.Auto}>
              Pick for me
            </ToggleButton>
            <ToggleButton value={RenewalTypes.Skip}>
              Skip them
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>
      {
        renewal === RenewalTypes.Auto &&
        <Grid container>
          <Grid item xs={12}>
            <Typography
              variant='h6'
              color='primary'
              className={classes.title}
            >
              What foods would you like in your meal plan?
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant='subtitle2' className={classes.subtitle}>
              We only pick 1 restaurant per week
            </Typography>
            <Typography
              component='p'
              variant='caption'
              color='error'
              className={classes.subtitle}
            >
              {props.autoSave? cuisinesError :props.selectedCuisinesError}
            </Typography>
          </Grid>
          <Grid container spacing={2}>
            {Object.values<CuisineType>(CuisineTypes).map(cuisine => {
              const withoutCuisine = cuisines.filter(c => cuisine !== c);
              const isSelected = withoutCuisine.length !== cuisines.length;
              return (
                <Grid
                  key={cuisine}
                  item
                  xs={6}
                  sm={4}
                  lg={3}
                >
                  <Button
                    fullWidth
                    color='primary'
                    variant={isSelected ? 'contained' : 'outlined'}
                    onClick={() => {
                      if (isSelected) {
                        setCuisines(withoutCuisine);
                        props.setSelectedCuisines(withoutCuisine);
                        if(props.autoSave === true ) {
                          setCuisinesError('Your picks are incomplete');
                        }
                        return;
                      }
                      // do onCuisineChange
                      setCuisines([...cuisines, cuisine]);
                      props.setSelectedCuisines([...cuisines, cuisine]);
                      if (withoutCuisine.length === 0) {
                        setCuisinesError('');
                        props.setSelectedCuisinesError('');
                      }
                    }}
                  >
                    {cuisine}
                  </Button>
                </Grid>
              )
            })}
          </Grid>
        </Grid>
      }
    </>
  );
}

export default RenewalChooser;