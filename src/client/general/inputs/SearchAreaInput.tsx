import * as React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import parse from 'autosuggest-highlight/parse';
import throttle from 'lodash/throttle';
import { Paper } from '@material-ui/core';
import { useSetSearchArea } from '../../global/state/cartState';
import withClientApollo from '../../utils/withClientApollo';
import { debounce } from 'lodash';

interface MainTextMatchedSubstrings {
  offset: number;
  length: number;
}

interface StructuredFormatting {
  main_text: string;
  secondary_text: string;
  main_text_matched_substrings: MainTextMatchedSubstrings[];
}

interface PlaceType {
  description: string;
  structured_formatting: StructuredFormatting;
}

// there only needs to be 1 autocompleteService for the entire app. so if we mount two of these
// components, we can share the same autocompleteService
const autocompleteService: {
  current: null | google.maps.places.AutocompleteService
} = {
  current: null 
};

const getSuggestions = (
  query: string,
  callback: (results?: PlaceType[]) => void
) => {
  if (!autocompleteService.current) {
    const err = new Error('AutocompleteService not initialized');
    console.error(err.stack);
    throw err;
  }
  autocompleteService.current.getPlacePredictions(
    {
      input: query,
      componentRestrictions: {
        country: 'us',
      }
    },
    callback,
  );
}

const getSuggestionsDelayed = function() {
  const throttledFn = throttle(getSuggestions, 400);
  const debouncedFn = debounce(getSuggestions, 400);
  return (
    query: string,
    callback: (results?: PlaceType[]) => void
  ) => {
    if (query.length < 4) {
      throttledFn(query, callback);
    } else {
      debouncedFn(query, callback);
    }
  }
}();

const useStyles = makeStyles((theme) => ({
  icon: {
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(2),
  },
  google: {
    marginLeft: theme.spacing(2),
  }
}));

const SearchAreaInput: React.FC<{
  onBlur?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  defaultValue?: string
  disableAutoFocus?: boolean
  onSelect?: (s: string) => void
}> = ({
  onBlur,
  defaultValue,
  disableAutoFocus = false,
  onSelect
}) => {
  const classes = useStyles();
  const setSearchArea = useSetSearchArea();
  const [selectedAddr, setSelectedAddr] = React.useState<PlaceType | null | string>(defaultValue || null);
  const [inputAddr, setInputValue] = React.useState('');
  const [options, setOptions] = React.useState<PlaceType[]>([]);
  React.useEffect(() => {
    let isSuggestionsOutdated = false;

    if (!autocompleteService.current) {
      if (!window.google) return;
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
    }

    if (!inputAddr) {
      setOptions([]);
      return;
    }

    getSuggestionsDelayed(inputAddr, (results?: PlaceType[]) => {
      if (!isSuggestionsOutdated) {
        let newOptions: PlaceType[] = [];
        if (selectedAddr && typeof selectedAddr !== 'string') newOptions = [selectedAddr];
        if (results) newOptions = [...newOptions, ...results];
        setOptions(newOptions);
      }
    });

    return () => { isSuggestionsOutdated = true };
  }, [selectedAddr, inputAddr]);
  const paperComponent: React.FC = ({ children }) => (
    <Paper>
      {children}
      <img src='/powered-by-google.png' className={classes.google} />
    </Paper>
  );

  const onSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (options.length > 0 && !onSelect) setSearchArea(options[0].description)
  }

  return (
    <form onSubmit={onSubmit}>
      <Autocomplete
        autoComplete
        freeSolo
        includeInputInList
        filterSelectedOptions
        inputValue={inputAddr}
        getOptionLabel={option => typeof option === 'string' ? option : option.description}
        // to disable the built-in filtering of the autocomplete component
        filterOptions={(x) => x}
        options={options}
        PaperComponent={paperComponent}
        value={selectedAddr}
        onChange={(_event, newValue) => {
          setSelectedAddr(newValue);
          if (newValue && typeof newValue !== 'string') {
            setOptions([newValue, ...options]);
            if (onSelect) {
              onSelect(newValue.description);
            } else {
              setSearchArea(newValue.description)
            }
          } else {
            setOptions(options)
          }
        }}
        onInputChange={(_event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        renderInput={params => (
          <TextField
            {...params}
            autoFocus={!disableAutoFocus}
            label='Enter Address'
            onBlur={onBlur}
            color='primary'
            variant='filled'
            fullWidth
          />
        )}
        renderOption={option => {
          const matches = option.structured_formatting.main_text_matched_substrings;
          const parts = parse(
            option.structured_formatting.main_text,
            matches.map((match: any) => [
              match.offset,
              match.offset + match.length,
            ]),
          );
          return (
            <Grid container alignItems='center'>
              <Grid item>
                <LocationOnIcon className={classes.icon} />
              </Grid>
              <Grid item xs>
                {parts.map((part, index) => (
                  <span
                    key={index}
                    style={{
                      fontWeight: part.highlight ? 700 : 400,
                    }}
                  >
                    {part.text}
                  </span>
                ))}
                <Typography variant='body2' color='textSecondary'>
                  {option.structured_formatting.secondary_text}
                </Typography>
              </Grid>
            </Grid>
          );
        }}
      />
    </form>
  );
}

export default withClientApollo(SearchAreaInput);