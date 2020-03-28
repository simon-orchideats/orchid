import { makeStyles, Button, Chip } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  donationButton: {
    flex: 0.15,
    boxShadow: 'none',
    color: `${theme.palette.common.white} !important`,
    minWidth: theme.spacing(4),
  },
  chip: {
    flex: 1,
    fontSize: '1.2rem',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  disabledChip: {
    color: theme.palette.text.disabled,
  },
}));

const Counter: React.FC<{
  subtractDisabled: boolean,
  onClickSubtract: () => void,
  subractIcon: React.ReactNode,
  chipLabel: number,
  chipDisabled: boolean,
  addDisabled: boolean,
  onClickAdd: () => void,
  addIcon: React.ReactNode,
}> = ({
  subtractDisabled,
  onClickSubtract,
  subractIcon,
  chipLabel,
  chipDisabled,
  addDisabled,
  onClickAdd,
  addIcon,
}) => {
  const classes = useStyles();
  return (
    <>
      <Button
        size='small'
        variant='text'
        disabled={subtractDisabled}
        className={classes.donationButton}
        onClick={onClickSubtract}
      >
        {subractIcon}
      </Button>
      <Chip
        className={classes.chip}
        disabled={chipDisabled}
        label={chipLabel}
        variant='outlined'
        classes={{
          disabled: classes.disabledChip
        }}
      />
      <Button
        size='small'
        variant='text'
        className={classes.donationButton}
        disabled={addDisabled}
        onClick={onClickAdd}
      >
        {addIcon}
      </Button>
    </>
  )
}

export default Counter;