import { useState, RefObject } from "react";
import BaseInput from "./BaseInput";
import { TextFieldProps } from "@material-ui/core";

type props = {
  setValidator: (validate: () => boolean) => void
  inputRef: RefObject<HTMLInputElement>
}

const PhoneInput: React.FC<props & TextFieldProps> = ({
  setValidator,
  inputRef,
  ...remaining
}) => {
  const [phoneError, setPhoneError] = useState('');
  const validate = () => {
    if (!inputRef!.current!.value) {
      setPhoneError('Your phone is incomplete');
      return false;
    }
    return true;
  }
  setValidator(validate);
  return (
    <BaseInput
      label='Phone'
      error={!!phoneError}
      helperText={phoneError}
      onBlur={() => validate()}
      inputRef={inputRef}
      onChange={_e => {
        if (phoneError) setPhoneError('');
      }}
      {...remaining}
    />
  )
}

export default PhoneInput;
