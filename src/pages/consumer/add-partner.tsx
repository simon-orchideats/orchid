import { makeStyles, Typography, Container, Paper, FormControlLabel, Checkbox, Button} from "@material-ui/core";
import { useRef, useState, createRef, RefObject } from 'react';
import { state } from "../../place/addressModel";
import AddressForm from "../../client/general/inputs/AddressForm";
import PhoneInput from "../../client/general/inputs/PhoneInput";
import BaseInput from "../../client/general/inputs/BaseInput";
import withClientApollo from "../../client/utils/withClientApollo";
import AddCircleIcon from '@material-ui/icons/AddCircle';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
    background: 'none',
    paddingBottom: theme.spacing(4),
  },
  verticalPadding: {
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(2),
  },
  paperContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
    marginTop: theme.spacing(3),
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
  addMenuItem: {
    marginTop: theme.spacing(3),
  },
}));

const OptionGroupInput: React.FC<{
  groupIndex: number
  nameInputRefs: RefObject<HTMLInputElement>[]
  onClickAdd: () => void
}> = ({
  groupIndex,
  nameInputRefs,
  onClickAdd,
}) => {
  return (
    <>
      <Typography>
        Option Group {groupIndex}
      </Typography>
      <Button onClick={onClickAdd} variant='outlined'>Add name</Button>
      {
        nameInputRefs.map((ref, i) => (
          <BaseInput
            key={`og-name-${i}`}
            label='Option name'
            inputRef={ref}
          />
        ))
      }
    </>
  )
}

const AddonGroupInput: React.FC<{
  groupIndex: number
  limitInputRef: RefObject<HTMLInputElement>
  nameInputRefs: RefObject<HTMLInputElement>[]
  onClickAdd: () => void
}> = ({
  groupIndex,
  limitInputRef,
  nameInputRefs,
  onClickAdd,
}) => {
  return (
    <>
      <Typography>
        Addon Group {groupIndex}
      </Typography>
      <Button onClick={onClickAdd} variant='outlined'>Add name</Button>
      <BaseInput label='limit' inputRef={limitInputRef} />
      {
        nameInputRefs.map((ref, i) => (
          <BaseInput
            key={`ag-name-${i}`}
            label='Addon name'
            inputRef={ref}
          />
        ))
      }
    </>
  )
}

type OptionGroupInputState = {
  names: RefObject<HTMLInputElement>[]
}
type AddonGroupInputState = {
  limit: RefObject<HTMLInputElement>
  names: RefObject<HTMLInputElement>[]
}

type MenuInput = {
  nameInputRef: RefObject<HTMLInputElement>,
  descriptionInputRef: RefObject<HTMLInputElement>,
  imgInputRef: RefObject<HTMLInputElement>,
  isActiveRef: RefObject<HTMLInputElement>,
  originalPriceInputRef: RefObject<HTMLInputElement>
  optionGroups: OptionGroupInputState[],
  addonGroups: AddonGroupInputState[],
}

const MenuItem: React.FC<
  MenuInput
  & {
    onAddOptionGroup: () => void,
    onAddOptionName: (groupIndex: number) => void,
    onAddAddonGroup: () => void,
    onAddAddonName: (groupIndex: number) => void,
  }
> = ({
  nameInputRef,
  descriptionInputRef,
  imgInputRef,
  originalPriceInputRef,
  optionGroups,
  isActiveRef,
  addonGroups,
  onAddOptionGroup,
  onAddOptionName,
  onAddAddonGroup,
  onAddAddonName
}) => {
  const classes = useStyles();
  return (
    <div className={classes.verticalPadding}>
      <BaseInput
        label='Name'
        inputRef={nameInputRef}
      />
      <BaseInput
        label='Description'
        inputRef={descriptionInputRef}
      />
      <BaseInput
        label='Img path'
        inputRef={imgInputRef}
      />
      <BaseInput
        label='Original price'
        inputRef={originalPriceInputRef}
      />
      <FormControlLabel
      control={
        <Checkbox
          inputRef={isActiveRef}
          color='primary'
        />
      }
      label='isActive'
      />
      <Typography variant='h6'>Option groups</Typography>
      <Button onClick={onAddOptionGroup} variant='outlined'>Add option group </Button>
      {
        optionGroups.map((og, i) =>
          <OptionGroupInput
            key={`og-${i}`}
            groupIndex={i}
            nameInputRefs={og.names}
            onClickAdd={() => onAddOptionName(i)}
          />
        )
      }
      <Typography variant='h6'>Addon groups</Typography>
      <Button onClick={onAddAddonGroup} variant='outlined'>Add addon group</Button>
      {
        addonGroups.map((ag, i) =>
          <AddonGroupInput
            key={`ag-${i}`}
            groupIndex={i}
            limitInputRef={ag.limit}
            nameInputRefs={ag.names}
            onClickAdd={() => onAddAddonName(i)}
          />
        )
      }
    </div>
  )
}

const AddPartner = () => {
  const classes = useStyles();
  const validateAddressRef = useRef<() => boolean>();
  const addr1InputRef = createRef<HTMLInputElement>();
  const addr2InputRef = createRef<HTMLInputElement>();
  const cityInputRef = createRef<HTMLInputElement>();
  const zipInputRef = createRef<HTMLInputElement>();
  const [state, setState] = useState<state | ''>('NJ');
  const validatePhoneRef = useRef<() => boolean>();
  const phoneInputRef = createRef<HTMLInputElement>();
  const nameInputRef = createRef<HTMLInputElement>();
  const [nameError, setNameError] = useState('');
  const getNewMenuItem = () => ({
    nameInputRef: createRef<HTMLInputElement>(),
    descriptionInputRef: createRef<HTMLInputElement>(),
    imgInputRef: createRef<HTMLInputElement>(),
    isActiveRef: createRef<HTMLInputElement>(),
    originalPriceInputRef: createRef<HTMLInputElement>(),
    optionGroups: [] as OptionGroupInputState[],
    addonGroups: [] as AddonGroupInputState[],
  })
  const [menuInputs, setMenuInputs] = useState<MenuInput[]>([ getNewMenuItem() ]);
  const addMenuItem = () => {
    setMenuInputs([
      ...menuInputs,
      getNewMenuItem()
    ])
  }
  const addOptionGroup = (menuIndex: number) => {
    const copy = [ ...menuInputs ];
    copy[menuIndex].optionGroups.push({
      // start with 2 because user would pick from at least 2
      names: [ createRef<HTMLInputElement>(), createRef<HTMLInputElement>()]
    })
    setMenuInputs(copy);
  }
  const addOptionName = (menuIndex: number) => {
    const copy = [ ...menuInputs ];
    return (groupIndex: number) => {
      copy[menuIndex].optionGroups[groupIndex].names.push(createRef<HTMLInputElement>());
      setMenuInputs(copy);
    }
  }
  const addAddonGroup = (menuIndex: number) => {
    const copy = [ ...menuInputs ];
    copy[menuIndex].addonGroups.push({
      limit: createRef<HTMLInputElement>(),
      names: [ createRef<HTMLInputElement>() ]
    })
    setMenuInputs(copy);
  }
  const addAddonName = (menuIndex: number) => {
    const copy = [ ...menuInputs ];
    return (groupIndex: number) => {
      copy[menuIndex].addonGroups[groupIndex].names.push(createRef<HTMLInputElement>());
      setMenuInputs(copy);
    }
  };
  const validateName = () => {
    if (!nameInputRef!.current!.value) {
      setNameError('Name required');
      return false;
    }
    return true;
  };
  const onAddPartner = () => {
    console.log(addr1InputRef?.current?.value);
    console.log(addr2InputRef?.current?.value);
    console.log(cityInputRef?.current?.value);
    console.log(zipInputRef?.current?.value);
    console.log(state);
    console.log(phoneInputRef?.current?.value);
    console.log(nameInputRef?.current?.value);
    menuInputs.forEach(mi => {
      console.log(mi.nameInputRef?.current?.value);
      console.log(mi.descriptionInputRef?.current?.value);
      console.log(mi.imgInputRef?.current?.value);
      console.log(mi.originalPriceInputRef?.current?.value);
      console.log(mi.isActiveRef?.current?.checked);
      mi.optionGroups.forEach(og => {
        og.names.forEach(n => console.log(n.current?.value));
      });
      mi.addonGroups.forEach(ag => {
        console.log(ag.limit?.current?.value);
        ag.names.forEach(n => console.log(n.current?.value));
      });
    });
  }
  return (
    <Container maxWidth='lg' className={classes.container}>
      <Typography variant='h3'>
        Add a Partner
      </Typography>
      <Paper className={classes.paperContainer}>
        <Typography
          variant='h4'
          color='primary'
          className={classes.verticalPadding}
        >
          Address
        </Typography>
        <AddressForm
          setValidator={(validator: () => boolean) => {
            validateAddressRef.current = validator;
          }}
          addr1InputRef={addr1InputRef}
          addr2InputRef={addr2InputRef}
          cityInputRef={cityInputRef}
          zipInputRef={zipInputRef}
          state={state}
          setState={setState}
        />
        <Typography
          variant='h4'
          color='primary'
          className={classes.verticalPadding}
        >
          Profile
        </Typography>
        <BaseInput
          label='Name'
          error={!!nameError}
          helperText={nameError}
          onBlur={validateName}
          inputRef={nameInputRef}
          onChange={_e => {
            if (nameError) setNameError('');
          }}
        />
        <PhoneInput
          inputRef={phoneInputRef}
          setValidator={(validator: () => boolean) => {
            validatePhoneRef.current = validator;
          }}
        />
        <Typography
          variant='h4'
          color='primary'
          className={classes.verticalPadding}
        >
          Menu
        </Typography>
        <AddCircleIcon onClick={addMenuItem} />
        {
          menuInputs.map((menu, i) =>
            <MenuItem 
              key={`menu-${i}`}
              {...menu}
              onAddOptionGroup={() => addOptionGroup(i)}
              onAddAddonGroup={() => addAddonGroup(i)}
              onAddOptionName={addOptionName(i)}
              onAddAddonName={addAddonName(i)}
            />
          )
        }
        <Button
          variant='contained'
          color='primary'
          onClick={onAddPartner}
        >
          Add
        </Button>
      </Paper>
    </Container>
  )
}

export default withClientApollo(AddPartner);

export const addPartnerRoute = '/consumer/add-partner';