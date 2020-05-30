import { Tooltip, ClickAwayListener } from '@material-ui/core';
import { useState } from 'react';

const WithClickToCopy: React.FC<{
  render: (
    onCopy: (str: string) => void
  ) => React.ReactElement
}> = ({
  render
}) => {
  const [open, setOpen] = useState(false);
  const onCopy = (str: string) => {
    setOpen(true);
    const input = document.createElement('input');
    document.body.appendChild(input)
    input.value = str;
    input.select();
    document.execCommand('copy', false);
    input.remove();
  }
  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Tooltip
        disableFocusListener
        disableHoverListener
        disableTouchListener
        open={open}
        onClose={() => setOpen(false)}
        title='Copied'
      >
        {render(onCopy)}
      </Tooltip>
    </ClickAwayListener>
  )
}

export default WithClickToCopy;
