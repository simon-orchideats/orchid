import { Typography, makeStyles, Grid, Button } from "@material-ui/core";
import { useState} from "react";
import { Tag, TagTypes } from "../../rest/tagModel";

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
  toggle: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontWeight: 600,
  },
  outlinedPrimary: {
    border: `1px solid ${theme.palette.divider}!important`,
    backgroundColor: `${theme.palette.common.white} !important`,
    color: theme.palette.text.primary,
    fontWeight: 400,
  }
}));

const RenewalChooser: React.FC<{
  validateCuisineRef: (validateCuisine: () => boolean) => void,
  allTags: Tag[],
  tags: Tag[],
  onTagChange: (tag: Tag[]) => void
}>= ({
  allTags,
  onTagChange,
  tags,
  validateCuisineRef
}) => {
  const [cuisinesError, setCuisinesError] = useState<string>('');
  const classes = useStyles();
  const validateCuisine = () => { 
    if (tags.filter(t => t.Type === TagTypes.Cuisine).length === 0) {
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
            Which foods are your favorite? We pick meals on weeks you don't plan ahead
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography
            component='p'
            variant='body1'
            color='error'
            className={classes.subtitle}
          >
            {cuisinesError}
          </Typography>
        </Grid>
        <Grid container spacing={2}>
          {allTags.filter(t => t.Type === TagTypes.Cuisine).map(tag => {
            const withoutCuisine = tags.filter(t => tag.Name !== t.Name);
            const isSelected = withoutCuisine.length !== tags.length;
            return (
              <Grid
                key={tag.Name}
                item
                xs={6}
                sm={4}
                lg={3}
              >
                <Button
                  fullWidth
                  color='primary'
                  variant='outlined'
                  className={classes.toggle}
                  onClick={() =>
                    isSelected ? onTagChange(withoutCuisine) : onTagChange([...tags, tag])
                  }
                  classes={{
                    outlinedPrimary: isSelected ? undefined : classes.outlinedPrimary,
                  }}
                >
                  {isSelected && '✔ '}{tag.Name}
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