import { makeStyles, Typography, Container, Paper, FormControlLabel, Checkbox, Button, Divider} from "@material-ui/core";
import React, { useRef, useState, createRef, RefObject } from 'react';
import { state } from "../../place/addressModel";
import AddressForm from "../../client/general/inputs/AddressForm";
import PhoneInput from "../../client/general/inputs/PhoneInput";
import BaseInput from "../../client/general/inputs/BaseInput";
import withClientApollo from "../../client/utils/withClientApollo";
import RenewalChooser from "../../client/general/RenewalChooser";
import { useAddRest, useGetTags } from "../../rest/restService";
import { useMutationResponseHandler } from "../../utils/apolloUtils";
import { useNotify } from "../../client/global/state/notificationState";
import Notifier from "../../client/notification/Notifier";
import { NotificationType } from "../../client/notification/notificationModel";
import DeleteIcon from '@material-ui/icons/Delete';
import { nanoid } from 'nanoid/non-secure'
import { Tag } from "../../rest/tagModel";

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
  largeVerticalPadding: {
    paddingBottom: theme.spacing(4),
    paddingTop: theme.spacing(4),
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
  verticalMargin: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  row: {
    display: 'flex',
  },
}));

type name = {
  key: string
  name: RefObject<HTMLInputElement>
}

type OptionGroupInputState = {
  key: string
  names: name[]
}
type AddonGroupInputState = {
  key: string
  limit: RefObject<HTMLInputElement>
  names: name[]
}

type MenuInput = {
  key: string
  tags: Tag[],
  nameInputRef: RefObject<HTMLInputElement>,
  descriptionInputRef: RefObject<HTMLInputElement>,
  imgInputRef: RefObject<HTMLInputElement>,
  isActiveRef: RefObject<HTMLInputElement>,
  originalPriceInputRef: RefObject<HTMLInputElement>
  optionGroups: OptionGroupInputState[],
  addonGroups: AddonGroupInputState[],
}

const OptionGroupInput: React.FC<{
  groupIndex: number
  names: name[]
  onClickAdd: () => void
  onRemoveGroup: () => void
  onRemoveName: (nameIndex: number) => void
}> = ({
  groupIndex,
  names,
  onClickAdd,
  onRemoveGroup,
  onRemoveName,
}) => {
  const classes = useStyles();
  return (
    <>
      <div className={classes.row}>
        <Typography>
          Option Group {groupIndex + 1}
        </Typography>
        <DeleteIcon onClick={onRemoveGroup} />
      </div>
      <Button onClick={onClickAdd} variant='outlined'>Add name</Button>
      {
        names.map((name, i) => (
          <div className={classes.row} key={name.key}>
            <BaseInput
              className={classes.verticalMargin}
              label='Option name'
              inputRef={name.name}
            />
            <DeleteIcon onClick={() => onRemoveName(i)} />
          </div>
        ))
      }
    </>
  )
}

const AddonGroupInput: React.FC<{
  groupIndex: number
  limitInputRef: RefObject<HTMLInputElement>
  names: name[]
  onClickAdd: () => void
  onRemoveGroup: () => void
  onRemoveName: (nameIndex: number) => void
}> = ({
  groupIndex,
  limitInputRef,
  names,
  onClickAdd,
  onRemoveGroup,
  onRemoveName,
}) => {
  const classes = useStyles();
  return (
    <>
      <div className={classes.row}>
        <Typography>
          Addon Group {groupIndex}
        </Typography>
        <DeleteIcon onClick={onRemoveGroup} />
      </div>
      <Button onClick={onClickAdd} variant='outlined'>Add name</Button>
      <BaseInput label='limit' inputRef={limitInputRef} />
      {
        names.map((name, i) => (
          <div className={classes.row} key={name.key}>
            <BaseInput
              className={classes.verticalMargin}
              label='Addon name'
              inputRef={name.name}
            />
            <DeleteIcon onClick={() => onRemoveName(i)} />
          </div>
        ))
      }
    </>
  )
}

const MenuItem: React.FC<
  Omit<MenuInput, 'key'>
  & {
    allTags: Tag[],
    onTagChange: (tags: Tag[]) => void,
    onAddOptionGroup: () => void,
    onAddOptionName: (groupIndex: number) => void,
    onAddAddonGroup: () => void,
    onAddAddonName: (groupIndex: number) => void,
    onRemoveMeal: () => void,
    onRemoveOptionGroup: (groupIndex: number) => void,
    onRemoveAddonGroup: (groupIndex: number) => void,
    onRemoveOptionName: (groupIndex: number, nameIndex: number) => void,
    onRemoveAddonName: (groupIndex: number, nameIndex: number) => void,
  }
> = ({
  allTags,
  tags,
  nameInputRef,
  descriptionInputRef,
  imgInputRef,
  originalPriceInputRef,
  optionGroups,
  isActiveRef,
  addonGroups,
  onTagChange,
  onAddOptionGroup,
  onAddOptionName,
  onAddAddonGroup,
  onAddAddonName,
  onRemoveMeal,
  onRemoveOptionGroup,
  onRemoveAddonGroup,
  onRemoveOptionName,
  onRemoveAddonName,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.largeVerticalPadding}>
      <Button variant='outlined' onClick={onRemoveMeal}>
        Remove {nameInputRef.current?.value}
      </Button>
      <BaseInput
        label='Name'
        className={classes.verticalMargin}
        inputRef={nameInputRef}
      />
      <BaseInput
        label='Description'
        className={classes.verticalMargin}
        inputRef={descriptionInputRef}
      />
      <BaseInput
        label='Img path'
        className={classes.verticalMargin}
        inputRef={imgInputRef}
      />
      <BaseInput
        label='Original price'
        className={classes.verticalMargin}
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
          <div className={classes.verticalPadding} key={og.key}>
            <OptionGroupInput
              groupIndex={i}
              names={og.names}
              onClickAdd={() => onAddOptionName(i)}
              onRemoveGroup={() => onRemoveOptionGroup(i)}
              onRemoveName={nameIndex => onRemoveOptionName(i, nameIndex)}
            />
          </div>
        )
      }
      <Typography variant='h6'>Addon groups</Typography>
      <Button onClick={onAddAddonGroup} variant='outlined'>Add addon group</Button>
      {
        addonGroups.map((ag, i) =>
          <div className={classes.verticalPadding} key={ag.key}>
            <AddonGroupInput
              key={`ag-${i}`}
              groupIndex={i}
              limitInputRef={ag.limit}
              names={ag.names}
              onClickAdd={() => onAddAddonName(i)}
              onRemoveGroup={() => onRemoveAddonGroup(i)}
              onRemoveName={nameIndex => onRemoveAddonName(i, nameIndex)}
            />
          </div>
        )
      }
      <RenewalChooser
        allTags={allTags}
        tags={tags}
        validateCuisineRef={() => {}}
        onTagChange={onTagChange}
      />
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
  const [addRest, addRestRes] = useAddRest();
  const [clickedAdd, setClickedAdd] = useState<boolean>(false);
  const allTags = useGetTags();
  const notify = useNotify();
  useMutationResponseHandler(addRestRes, () => {
    notify('Added. Refresh page to add another', NotificationType.success, true);
  });
  const getNewMenuItem = () => ({
    key: nanoid(5),
    nameInputRef: createRef<HTMLInputElement>(),
    descriptionInputRef: createRef<HTMLInputElement>(),
    imgInputRef: createRef<HTMLInputElement>(),
    isActiveRef: createRef<HTMLInputElement>(),
    tags: [] as Tag[],
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
      key: nanoid(5),
      // start with 2 because user would pick from at least 2
      names: [
        {
          key: nanoid(5),
          name: createRef<HTMLInputElement>(),
        },
        {
          key: nanoid(5),
          name: createRef<HTMLInputElement>()
        }
      ]
    })
    setMenuInputs(copy);
  }
  const addOptionName = (menuIndex: number) => {
    const copy = [ ...menuInputs ];
    return (groupIndex: number) => {
      copy[menuIndex].optionGroups[groupIndex].names.push({
        key: nanoid(5),
        name: createRef<HTMLInputElement>()
      });
      setMenuInputs(copy);
    }
  }
  const addAddonGroup = (menuIndex: number) => {
    const copy = [ ...menuInputs ];
    copy[menuIndex].addonGroups.push({
      key: nanoid(5),
      limit: createRef<HTMLInputElement>(),
      names: [ 
        {
          key: nanoid(5),
          name: createRef<HTMLInputElement>()
        }
      ]
    })
    setMenuInputs(copy);
  }
  const addAddonName = (menuIndex: number) => {
    const copy = [ ...menuInputs ];
    return (groupIndex: number) => {
      copy[menuIndex].addonGroups[groupIndex].names.push({
        key: nanoid(5),
        name: createRef<HTMLInputElement>()
      });
      setMenuInputs(copy);
    }
  };
  const changeTag = (menuIndex: number) => {
    const copy = [ ...menuInputs ];
    return (tags: Tag[]) => {
      copy[menuIndex].tags = tags;
      setMenuInputs(copy);
    }
  }
  const onRemoveMeal = (menuIndex: number) => {
    const copy = [ ...menuInputs ];
    copy.splice(menuIndex, 1);
    setMenuInputs(copy);
  }
  const onRemoveOptionGroup = (menuIndex: number) => {
    const copy = [ ...menuInputs ];
    return (groupIndex: number) => {
      copy[menuIndex].optionGroups.splice(groupIndex, 1);
      setMenuInputs(copy);
    }
  };
  const onRemoveAddonGroup = (menuIndex: number) => {
    const copy = [ ...menuInputs ];
    return (groupIndex: number) => {
      copy[menuIndex].addonGroups.splice(groupIndex, 1);
      setMenuInputs(copy);
    }
  };
  const onRemoveOptionName = (menuIndex: number) => {
    const copy = [ ...menuInputs ];
    return (groupIndex: number, nameIndex: number) => {
      copy[menuIndex].optionGroups[groupIndex].names.splice(nameIndex, 1);
      setMenuInputs(copy);
    }
  };
  const onRemoveAddonName = (menuIndex: number) => {
    const copy = [ ...menuInputs ];
    return (groupIndex: number, nameIndex: number) => {
      copy[menuIndex].addonGroups[groupIndex].names.splice(nameIndex, 1);
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
    setClickedAdd(true);
    addRest({
      address: {
        address1: addr1InputRef?.current!.value,
        address2: addr2InputRef.current?.value,
        city: cityInputRef.current!.value,
        state: state as state,
        zip: zipInputRef?.current!.value
      },
      profile: {
        name: nameInputRef?.current!.value,
        phone: phoneInputRef?.current!.value
      },
      menu: menuInputs.map(mi => ({
        name: mi.nameInputRef?.current!.value,
        img: mi.imgInputRef?.current!.value,
        isActive: mi.isActiveRef?.current!.checked,
        description: mi.descriptionInputRef?.current!.value,
        originalPrice: parseFloat(mi.originalPriceInputRef?.current!.value),
        optionGroups: mi.optionGroups.map(og => ({
          names: og.names.map(n => n.name.current!.value)
        })),
        addonGroups: mi.addonGroups.map(ag => ({
          limit: ag.limit.current?.value ? parseFloat(ag.limit.current?.value) : undefined,
          names: ag.names.map(n => n.name.current!.value)
        })),
        tags: mi.tags.map(t => Tag.getICopy(t)),
      }))
    });
  }
  return (
    <Container maxWidth='lg' className={classes.container}>
      <Notifier />
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
          className={classes.verticalMargin}
          helperText={nameError}
          onBlur={validateName}
          inputRef={nameInputRef}
          onChange={_e => {
            if (nameError) setNameError('');
          }}
        />
        <PhoneInput
          inputRef={phoneInputRef}
          className={classes.verticalMargin}
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
        {
          menuInputs.map((menu, i) =>
            <React.Fragment key={menu.key}>
              <MenuItem 
                {...menu}
                allTags={allTags.data || []}
                onTagChange={changeTag(i)}
                onAddOptionGroup={() => addOptionGroup(i)}
                onAddAddonGroup={() => addAddonGroup(i)}
                onAddOptionName={addOptionName(i)}
                onAddAddonName={addAddonName(i)}
                onRemoveMeal={() => onRemoveMeal(i)}
                onRemoveOptionGroup={onRemoveOptionGroup(i)}
                onRemoveAddonGroup={onRemoveAddonGroup(i)}
                onRemoveOptionName={onRemoveOptionName(i)}
                onRemoveAddonName={onRemoveAddonName(i)}
              />
              <Divider />
            </React.Fragment>
          )
        }
        <Button
          onClick={addMenuItem}
          color='primary'
          variant='outlined'
          className={classes.verticalMargin}
        >
          Add meal
        </Button>
        <Button
          variant='contained'
          color='primary'
          onClick={onAddPartner}
          disabled={clickedAdd}
        >
          Add
        </Button>
      </Paper>
    </Container>
  )
}

export default withClientApollo(AddPartner);

export const addPartnerRoute = '/consumer/add-partner';