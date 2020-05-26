import { makeStyles, Button, Chip, ButtonProps } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  button: {
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
  subtractButtonProps?: ButtonProps,
  onClickSubtract: () => void,
  subractIcon: React.ReactNode,
  chipLabel: number,
  chipDisabled: boolean,
  addDisabled?: boolean,
  onClickAdd: (event: React.MouseEvent<HTMLElement>) => void,
  addIcon: React.ReactNode,
  addButtonProps?: ButtonProps,
}> = ({
  subtractDisabled,
  subtractButtonProps = {},
  onClickSubtract,
  subractIcon,
  chipLabel,
  chipDisabled,
  addDisabled = false,
  onClickAdd,
  addIcon,
  addButtonProps = {},
}) => {
  const classes = useStyles();
  const {
    className: subClassName,
    ...subRemainingPRops
  } = subtractButtonProps
  const {
    className: addClassName,
    ...addRemainingProps
  } = addButtonProps
  return (
    <>
      <Button
        size='small'
        variant='text'
        disabled={subtractDisabled}
        className={`${classes.button} ${subClassName}`}
        onClick={onClickSubtract}
        {...subRemainingPRops}
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
        className={`${classes.button} ${addClassName}`}
        disabled={addDisabled}
        onClick={onClickAdd}
        {...addRemainingProps}
      >
        {addIcon}
      </Button>
    </>
  )
}

export default Counter;