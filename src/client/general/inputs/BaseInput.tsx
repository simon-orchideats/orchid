import { TextField, TextFieldProps } from "@material-ui/core";

const BaseInput: React.FC<TextFieldProps> = props => (
  // https://github.com/mui-org/material-ui/issues/15697
  // @ts-ignore
  <TextField
    variant='outlined'
    size='small'
    fullWidth
    {...props}
  />
)


export default BaseInput;
