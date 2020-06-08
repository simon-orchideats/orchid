import BaseInput from "./BaseInput";
import { TextFieldProps, IconButton, makeStyles, InputAdornment } from "@material-ui/core";
import SearchIcon from '@material-ui/icons/Search';

const useStyles = makeStyles(() => ({
  row: {
    display: 'flex',
  }
}));

type props = {
  search: string
  onSearchChange: (search: string) => void
  onSearch: () => void
}

const SearchInput: React.FC<props & TextFieldProps> = ({
  search,
  onSearchChange,
  onSearch,
  ...remaining
}) => {
  const classes = useStyles();
  const onSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSearch();
  }
  return (
    <div className={classes.row}>
      <form onSubmit={onSubmit}>
        <BaseInput
          autoFocus
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          variant='standard'
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton
                  size='small'
                  onClick={onSearch}
                >
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
          {...remaining}
        />
      </form>
    </div>
  );
}

export default SearchInput;
