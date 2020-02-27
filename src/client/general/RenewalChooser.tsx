
import { RenewalTypes, RenewalType, CuisineTypes, CuisineType } from "../../consumer/consumerModel";
import { Typography, makeStyles, Grid, Button } from "@material-ui/core";
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { useState, useRef, useEffect } from "react";

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

interface RenewalProps {
  validateCuisineRef: (validateCuisine: () => boolean) => void,
  renewal:RenewalType,
  cuisines:CuisineType[],
  onRenewalChange: (renewal:RenewalType) => void,
  onCuisineChange: (cuisine:CuisineType[]) => void
}

const RenewalChooser = (props:RenewalProps) => {
  const [cuisinesError, setCuisinesError] = useState<string>('');
  const {onCuisineChange, onRenewalChange, cuisines, renewal, validateCuisineRef} = props;
  const classes = useStyles();
  const errorRef = useRef(cuisinesError);
  // Create function for parent to reference to
  const validateCuisine = () => { 
    if (errorRef.current) {
      return false;
    }
    return true;
  }
  // Pass function back up to parent
  validateCuisineRef(validateCuisine);
  useEffect( () => {
    errorRef.current=cuisinesError
  },[cuisinesError])
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
              onRenewalChange(rt);
              if (cuisines.length===0 && rt === RenewalTypes.Auto) {
               setCuisinesError('Please pick 1 type')
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
      {renewal === RenewalTypes.Auto &&
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
              { cuisinesError }
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
                      if (isSelected && cuisines.length == 1) {
                        setCuisinesError('Pick at least 1 type');
                      }
                      if (isSelected) {
                        onCuisineChange(withoutCuisine);
                        return;
                      }
                      onCuisineChange([...cuisines, cuisine]);
                      if (withoutCuisine.length === 0) {
                        setCuisinesError('');
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