import { makeStyles, FormControl, FormLabel, FormGroup, Checkbox, FormControlLabel, Popover, Paper, Button } from "@material-ui/core";
import { CuisineType, CuisineTypes } from "../../consumer/consumerModel";
import { useState } from "react";

const useStyles = makeStyles(theme => ({
  zip: {
    paddingBottom: theme.spacing(1),
  },
  cuisines: {
    paddingTop: theme.spacing(1),
  },
  popper: {
    padding: theme.spacing(2),
  },
}));

const Filter: React.FC<{
  zip?: React.ReactNode,
  cuisines: CuisineType[],
  onClickCuisine: (cuisines: CuisineType[]) => void
}> = ({
  zip,
  cuisines,
  onClickCuisine
}) => {
  const classes = useStyles();
  const allCuisines = Object.values<CuisineType>(CuisineTypes);
  const [anchorEl, setMoreAnchor] = useState<null | HTMLElement>(null);
  const onClickFilter = (event: React.MouseEvent<HTMLElement>) => {
    setMoreAnchor(anchorEl ? null : event.currentTarget);
  };
  const isFiltering = Boolean(anchorEl);
  return (
    <>
      <Popover
        open={isFiltering}
        anchorEl={anchorEl}
        onClose={() => setMoreAnchor(null)} 
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Paper className={classes.popper}>
          <FormControl>
            {
              zip &&
              <>
                <FormLabel className={classes.zip}>
                  Zip
                </FormLabel>
                {zip}
              </>
            }
            <FormLabel className={classes.cuisines}>
              Cuisines
            </FormLabel>
            <FormGroup>
              {
                allCuisines.map(cuisine => {
                  const withoutCuisine = cuisines.filter(c => cuisine !== c);
                  const isSelected = withoutCuisine.length !== cuisines.length;
                  return (
                    <FormControlLabel key={cuisine}
                      control={
                        <Checkbox
                          color='primary'
                          checked={isSelected}
                          onChange={() => onClickCuisine(isSelected ? withoutCuisine : [...cuisines, cuisine])}
                        />
                      }
                      label={cuisine}
                    />
                  )
                })
              }
            </FormGroup>
          </FormControl>
        </Paper>
      </Popover>
      <Button
        variant='text'
        color='primary'
        onClick={onClickFilter}
      >
        Filter
      </Button>
    </>
  )
}

export default Filter;