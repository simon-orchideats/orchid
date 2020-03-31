import { useState, RefObject, Dispatch, SetStateAction } from "react";
import BaseInput from "./BaseInput";
import { Grid } from "@material-ui/core";
import Autocomplete from '@material-ui/lab/Autocomplete';
import { state } from "../../../place/addressModel";

type props = {
  setValidator: (validate: () => boolean) => void
  addr1InputRef: RefObject<HTMLInputElement>
  addr2InputRef: RefObject<HTMLInputElement>
  cityInputRef: RefObject<HTMLInputElement>
  zipInputRef: RefObject<HTMLInputElement>
  state: state | '',
  setState: Dispatch<SetStateAction<state | ''>>
}

const AddressForm: React.FC<props> = ({
  setValidator,
  addr1InputRef,
  addr2InputRef,
  cityInputRef,
  zipInputRef,
  state,
  // setState,
}) => {
  const [addr1Error, setAddr1Error] = useState('');
  const [cityError, setCityError] = useState('');
  const [stateError, setStateError] = useState('');
  const [zipError, setZipError] = useState('');
  const validateAddr1 = () => {
    if (!addr1InputRef!.current!.value) {
      setAddr1Error('Enter address');
      return false;
    }
    return true;
  }
  const validateCity = () => {
    if (!cityInputRef!.current!.value) {
      setCityError('Enter city');
      return false;
    }
    return true;
  }
  const validateState = () => {
    if (!state) {
      setStateError('Enter state');
      return false;
    }
    return true;
  }
  const validateZip = () => {
    if (!zipInputRef!.current!.value) {
      setZipError('Enter zip');
      return false;
    }
    return true;
  }
  const validate = () => {
    let isValid = true;
    if (!validateAddr1()) {
      isValid = false;
    }
    if (!validateCity()) {
      isValid = false;
    }
    if (!validateState()) {
      isValid = false;
    }
    if (!validateZip()) {
      isValid = false;
    }
    return isValid;
  }
  setValidator(validate);
  return (
    <Grid container spacing={2}>
      <Grid
        item
        xs={12}
        md={6}
      >
        <BaseInput
          label='Address'
          error={!!addr1Error}
          helperText={addr1Error}
          onBlur={() => validateAddr1()}
          inputRef={addr1InputRef}
          onChange={_e => {
            if (addr1Error) setAddr1Error('');
          }}
        />
      </Grid>
      <Grid
        item
        xs={12}
        md={6}
      >
        <BaseInput
          label='Apt, suite, floor'
          inputRef={addr2InputRef}
        />
      </Grid>
      <Grid
        item
        xs={12}
        md={6}
      >
        <BaseInput
          label='City'
          error={!!cityError}
          helperText={cityError}
          onBlur={() => validateCity()}
          inputRef={cityInputRef}
          onChange={_e => {
            if (cityError) setCityError('');
          }}
        />
      </Grid>
      <Grid
        item
        xs={12}
        md={3}
      >
        <Autocomplete
          options={['NJ']}
          value={state || '' as state}
          // onChange={(_e: any, value: state | null) => {
          //   setState(value ? value : '');
          //   if (stateError) setStateError('');
          // }}
          renderInput={params => (
            <BaseInput
              {...params}
              label='State'
              size='small' // necessary to override ...params
              onBlur={() => validateState()}
              error={!!stateError}
              helperText={stateError}
            />
          )}
        />
      </Grid>
      <Grid
        item
        xs={12}
        md={3}
      >
        <BaseInput
          label='Zip'
          error={!!zipError}
          helperText={zipError}
          onBlur={() => validateZip()}
          inputRef={zipInputRef}
          onChange={_e => {
            if (zipError) setZipError('');
          }}
        />
      </Grid>
    </Grid>
  )
}

export default AddressForm;
