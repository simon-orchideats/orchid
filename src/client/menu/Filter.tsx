import { makeStyles, FormControl, FormLabel, FormGroup, Checkbox, FormControlLabel, Popover, Paper, Button } from "@material-ui/core";
import { useState } from "react";
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

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
  link: {
    border: `1px solid ${theme.palette.common.link} !important`,
    color: theme.palette.common.link,
  },
}));

const Filter: React.FC<{
  label: string
  allCuisines: string[]
  zip?: React.ReactNode,
  cuisines: string[],
  onClickCuisine: (cuisines: string[]) => void
}> = ({
  allCuisines,
  label,
  zip,
  cuisines,
  onClickCuisine
}) => {
  const classes = useStyles();
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
                    <FormControlLabel
                      key={cuisine}
                      control={
                        <Checkbox
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
        variant='outlined'
        className={classes.link}
        onClick={onClickFilter}
      >
        {label}
        <ArrowDropDownIcon />
      </Button>
    </>
  )
}

export default Filter;