import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Slide from '@material-ui/core/Slide';
import { Paper, IconButton} from '@material-ui/core';
import Close from '@material-ui/icons/Close';
import MenuCartDisplay from '../menu/MenuCartDisplay';

const useStyles = makeStyles(theme => ({
  paper: {
    height: '100%',
    overflowY: 'scroll',
    padding: theme.spacing(2),
    paddingTop: 0,
    backgroundColor: theme.palette.background.paper,
  },
  bar: {
    display: 'flex',
    alignItems: 'center',
    width: '100%'
  },
  col: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
}));

const CartModal: React.FC<{
  open: boolean,
  onClose: () => void,
}> = ({
  open,
  onClose,
}) => {
  const classes = useStyles();
  return (
    <Modal
      open={open}
      onClose={onClose}
      disableEscapeKeyDown
    >
      <Slide in={open} direction='down'>
        <Paper className={classes.paper}>
          <div className={classes.col}>
            <div className={`${classes.bar}`}>
              <IconButton onClick={onClose}>
                <Close fontSize='large' />
              </IconButton>
            </div>
            <MenuCartDisplay />
          </div>
        </Paper>
      </Slide>
    </Modal>
  );
}

export default CartModal;
