
import { CuisineTypes, CuisineType } from "../../rest/mealModel";
import { Typography, makeStyles, Grid, Button } from "@material-ui/core";
import { useState} from "react";

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

const RenewalChooser: React.FC<{
  validateCuisineRef: (validateCuisine: () => boolean) => void,
  cuisines: CuisineType[],
  onCuisineChange: (cuisine:CuisineType[]) => void
}>= ({
  onCuisineChange,
  cuisines,
  validateCuisineRef
}) => {
  const [cuisinesError, setCuisinesError] = useState<string>('');
  const classes = useStyles();
  const validateCuisine = () => { 
    if (cuisines.length === 0) {
      if (!cuisinesError) setCuisinesError('Please pick 1 type')
      return false;
    }
    if (cuisinesError) setCuisinesError('');
    return true;
  }
  // Pass function back up to parent
  validateCuisineRef(validateCuisine);
  validateCuisine()
  return (
    <>
      <Grid container>
        <Grid item xs={12}>
          <Typography
            variant='h6'
            color='primary'
            className={classes.title}
          >
            What foods would you like us to pick for you?
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography
            component='p'
            variant='caption'
            color='error'
            className={classes.subtitle}
          >
            {cuisinesError}
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
                  onClick={() =>
                    isSelected ? onCuisineChange(withoutCuisine) : onCuisineChange([...cuisines, cuisine])
                  }
                >
                  {cuisine}
                </Button>
              </Grid>
            )
          })}
        </Grid>
      </Grid>
    </>
  );
}

export default RenewalChooser;