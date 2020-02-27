import { useState, RefObject } from "react";
import BaseInput from "./BaseInput";
import { TextFieldProps } from "@material-ui/core";

type props = {
  setValidator: (validate: () => boolean) => void
  inputRef: RefObject<HTMLInputElement>
}

const EmailInput: React.FC<props & TextFieldProps> = ({
  setValidator,
  inputRef,
  ...remaining
}) => {
  const [emailError, setEmailError] = useState('');
  const validate = () => {
    const email = inputRef!.current!.value;
    if (!email) {
      setEmailError('Please enter email');
      return false;
    }
    const regex = /\S+@\S+\.\S+/; // simple regex to cover majority of cases
    if (!regex.test(email)) {
      setEmailError('Please enter an email like example@example.com');
      return false;
    }
    return true;
  }
  setValidator(validate);
  return (
    <BaseInput
      label='Email'
      error={!!emailError}
      helperText={emailError}
      onBlur={() => validate()}
      inputRef={inputRef}
      onChange={_e => {
        if (emailError) setEmailError('');
      }}
      {...remaining}
    />
  )
}

export default EmailInput;
