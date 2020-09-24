import { makeStyles, Typography, Grid, Button, IconButton, Paper, TextField, Popover } from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { useState } from "react";
import { useIncrementMealCount, useRemoveMealFromCart, useSetInstruction } from "../global/state/cartState";
import { IOrderMeal } from "../../order/orderRestModel";

const useStyles = makeStyles(theme => ({
  group: {
    display: 'flex',
    alignItems: 'center',
  },
  img: {
    width: 55,
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
  icon: {
    fontSize: '1.8rem',
  },
  more: {
    padding: 0,
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  popper: {
    width: 300,
    padding: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
  },
}));

const CartMealGroup: React.FC<{
  m: IOrderMeal
}> = ({
  m
 }) => {
  const incrementMealCount = useIncrementMealCount();
  const removeMealFromCart = useRemoveMealFromCart();
  const setInstruction = useSetInstruction();
  const [instructionsAnchor, setInstructionsAnchor] = useState<null | HTMLElement>(null);
  const onClickMore = (event: React.MouseEvent<HTMLElement>) => {
    setInstructionsAnchor(instructionsAnchor ? null : event.currentTarget);
  };
  const onCloseInstructions = () => {
    setInstructionsAnchor(null);
    setInstruction(m, instructions ? instructions : null);
  }
  const [instructions, setInstructions] = useState<string | null>(m.instructions)
  const classes = useStyles({ img: m.img });
  const imgCol = 4;
  const nameCol: 6 | 10 = m.img ? 6 as 6: 6 + imgCol as 6 | 10;
  return (
    <Grid
      container
      className={classes.group}
      wrap='nowrap'
    >
      <Grid
        item
        sm={1}
        className={classes.col}
      >
        <Button
          variant='text'
          color='primary'
          onClick={() => incrementMealCount(m)}
        >
          <AddIcon className={classes.icon} />
        </Button>
        <Typography variant='h6'>
          {m.quantity}
        </Typography>
        <Button
          variant='text'
          onClick={() => removeMealFromCart(m)}
        >
          <RemoveIcon className={classes.icon} />
        </Button>
      </Grid>
      {
        m.img &&
        <Grid item sm={imgCol}>
          <img
            src={m.img}
            alt={m.img}
            className={classes.img}
          />
        </Grid>
      }
      <Grid item sm={nameCol}>
        <Typography variant='subtitle1'>
          {m.name}
        </Typography>
        <Typography variant='body1' color='textSecondary'>
          {m.choices && m.choices.join(', ')}
        </Typography>
        <Typography variant='body1' color='textSecondary'>
          {m.instructions}
        </Typography>
      </Grid>
      <Grid item sm={1}>
        <IconButton onClick={onClickMore} className={classes.more}>
          <MoreVertIcon />
        </IconButton>
      </Grid>
      <Popover
        open={Boolean(instructionsAnchor)}
        anchorEl={instructionsAnchor}
        onClose={onCloseInstructions}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Paper className={classes.popper}>
          <TextField
            fullWidth
            label='Instructions'
            placeholder='Instructions'
            multiline
            variant='outlined'
            value={instructions ? instructions : undefined}
            onChange={e => setInstructions(e.target.value)}
          />
        </Paper>
      </Popover>
    </Grid>
  )
}

export default CartMealGroup;