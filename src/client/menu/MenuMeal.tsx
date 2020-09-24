import React, { useState } from 'react';
import { IMeal } from "../../rest/mealModel";
import { useAddMealToCart } from "../global/state/cartState";
import { makeStyles, Card, CardMedia, CardContent, Typography, useMediaQuery, useTheme, Theme, Popover, Paper, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, FormGroup, Checkbox, Button, Tooltip, ClickAwayListener } from "@material-ui/core";
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import AddBoxIcon from '@material-ui/icons/AddBox';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

const useStyles = makeStyles(theme => ({
  card: {
    maxWidth: 225,
    background: 'none',
    textAlign: 'center',
    marginLeft: 2,
    marginRight: 2,
    [theme.breakpoints.up('md')]: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
  },
  content: {
    paddingRight: 0,
    paddingLeft: 0,
    paddingBottom: `${theme.spacing(1)} !important`,
    paddingTop: 4,
    cursor: 'pointer',
    [theme.breakpoints.up('md')]: {
      paddingTop: undefined,
    },
  },
  scaler: ({ meal }: { meal: IMeal }) => ({
    width: '100%',
    paddingBottom: meal.img ? '100%' : undefined,
    paddingTop: meal.img ? undefined : '100%',
    position: 'relative',
    cursor: 'pointer',
  }),
  img: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end'
  },
  title: {
    lineHeight: 1.5,
    fontWeight: 500,
  },
  desc: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
  },
  imgAdd: {
    color: theme.palette.common.white
  },
  popper: {
    width: 300,
    padding: theme.spacing(2),
  },
  detail: {
    fontSize: '1rem',
    verticalAlign: 'text-bottom'
  },
  choiceLabel: {
    fontSize: '1.5rem',
  }
}));

const MenuMeal: React.FC<{
  deliveryFee: number,
  meal: IMeal,
  restId: string,
  restName: string,
  taxRate: number,
}> = ({
  deliveryFee,
  meal,
  restId,
  restName,
  taxRate,
}) => {
  const theme = useTheme<Theme>();
  const classes = useStyles({ meal });
  const isMdAndUp = useMediaQuery(theme.breakpoints.up('md'));
  const [descAnchor, setDescAnchor] = useState<null | HTMLElement>(null);
  const [choicesAnchor, setChoicesAnchor] = useState<null | HTMLElement>(null);
  const [isTooltipOpen, setIsTooltipOpen] = React.useState(false);
  const [desc, setDesc] = useState<string>();
  const [optionGroupIndex, setOptionGroupIndex] = useState<number>(0);
  const [addonGroupIndex, setAddonGroupIndex] = useState<number>(0);
  const addMealToCart = useAddMealToCart();
  type addonGroupsState = {
    [name: string]: {
      isChecked: boolean,
      name: string,
    },
  }
  const defaultOptions = {};
  const [options, setOptions] = useState<{ [groupIndex: number]: string }>(defaultOptions);
  const defaultAddons = meal.addonGroups.reduce<addonGroupsState>((sum, ag, i) => ({
    ...sum,
    ...ag.names.reduce<addonGroupsState>((innerSum, name) => {
      innerSum[`${i}-${name}`] = {
        isChecked: false,
        name,
      };
      return innerSum;
    }, {})
  }), {});
  const defaultAddonCounts = {};
  const [addonCounts, setAddonCounts] = useState<{ [groupIndex: number]: number }>(defaultAddonCounts);
  const [addons, setAddons] = useState(defaultAddons);
  const onClickAdd = (event: React.MouseEvent<HTMLElement>) => {
    if (meal.optionGroups.length === 0 && meal.addonGroups.length === 0) {
      addMealToCart(
        meal,
        [],
        deliveryFee,
        restId,
        restName,
        taxRate,
      );
      openTooltip();
      setChoicesAnchor(null);
    } else {
      setChoicesAnchor(event.currentTarget);
    }
  };
  const onClickContent = (event: React.MouseEvent<HTMLElement>, mealDesc: string) => {
    setDescAnchor(descAnchor ? null : event.currentTarget);
    setDesc(mealDesc || 'No description');
  };
  const onClickAddon = (addonGroupIndex: number, name: string, isChecked: boolean) => {
    setAddons({
      ...addons,
      [`${addonGroupIndex}-${name}`]: {
        isChecked,
        name,
      },
    });
    const currAddonCount = addonCounts[addonGroupIndex];
    if (isChecked) {
      setAddonCounts({
        ...addonCounts,
        [addonGroupIndex]: currAddonCount ? currAddonCount + 1 : 1,
      });
    } else {
      setAddonCounts({
        ...addonCounts,
        [addonGroupIndex]: currAddonCount - 1,
      })
    }
  }
  const onClickNextAddon = () => {
    const nextIndex = addonGroupIndex + 1;
    if (nextIndex === meal.addonGroups.length) {
      addMealToCart(
        meal,
        [ ...Object.values(options), ...Object.values(addons).filter(a => a.isChecked).map(a => a.name)],
        deliveryFee,
        restId,
        restName,
        taxRate,
      );
      openTooltip();
      onCloseChoices();
    } else {
      setAddonGroupIndex(nextIndex);
    }
  }
  const onCloseChoices = () => {
    setOptionGroupIndex(0);
    setAddonGroupIndex(0);
    setChoicesAnchor(null);
    setOptions(defaultOptions);
    setAddons(defaultAddons);
    setAddonCounts(defaultAddonCounts);
  }

  const onClickRadio = (e: React.MouseEvent<HTMLLabelElement, MouseEvent>, selectedOption: string) => {
    // prevenDefault so the event doesn't bubble up and trigger a second event callback
    e.preventDefault();
    const newGroupIndex = optionGroupIndex + 1;
    if (newGroupIndex === meal.optionGroups.length && meal.addonGroups.length === 0) {
      addMealToCart(
        meal,
        [...Object.values(options), selectedOption],
        deliveryFee,
        restId,
        restName,
        taxRate,
      );
      openTooltip();
      onCloseChoices();
    } else {
      setOptions({
        ...options,
        [optionGroupIndex]: selectedOption,
      });
      setOptionGroupIndex(newGroupIndex);
    }
  }
  const openTooltip = () => {
    setIsTooltipOpen(true);
    setTimeout(closeTooltip, 1500);
  }
  const closeTooltip = () => {
    setIsTooltipOpen(false);
  }
  return (
    <Card elevation={0} className={classes.card}>
      <Popover
        open={Boolean(choicesAnchor)}
        anchorEl={choicesAnchor}
        onClose={() => onCloseChoices()}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <Paper className={classes.popper}>
          {
            (optionGroupIndex > 0 || addonGroupIndex > 0) &&
            <ArrowBackIcon onClick={() => {
              if (addonGroupIndex > 0) {
                setAddonGroupIndex(addonGroupIndex - 1);
                return;
              }
              setOptionGroupIndex(optionGroupIndex - 1);
            }}/>
          }
          {
            optionGroupIndex < meal.optionGroups.length &&
            <FormControl>
              <FormLabel focused={false} className={classes.choiceLabel}>
                Pick one
              </FormLabel>
              {
                meal.optionGroups.map((og, i) => (
                  i === optionGroupIndex &&
                  <RadioGroup key={`og-${i}`} value={options[optionGroupIndex] || false}>
                    {
                      og.names.map((name, j) =>
                        <FormControlLabel
                          key={`og-names-${j}`}
                          value={name}
                          control={<Radio color='primary' />}
                          label={name}
                          onClick={e => onClickRadio(e, name)}
                        />
                      )
                    }
                  </RadioGroup>
                ))
              }
            </FormControl>
          }
          {
            optionGroupIndex >= meal.optionGroups.length && addonGroupIndex < meal.addonGroups.length &&
            <FormControl>
              <FormLabel
                focused={false}
                className={classes.choiceLabel} 
                onClick={() => setAddonGroupIndex(addonGroupIndex - 1)}
              >
                Pick {meal.addonGroups[addonGroupIndex].limit ? `max ${meal.addonGroups[addonGroupIndex].limit}` : 'any'}
              </FormLabel>
              {
                meal.addonGroups.map((ag, i) => (
                  i === addonGroupIndex &&
                  <FormGroup key={`ag-${i}`}>
                    {
                      ag.names.map((name, j) =>
                        <FormControlLabel
                          key={`ag-names-${j}`}
                          control={
                            <Checkbox
                              checked={addons[`${i}-${name}`].isChecked}
                              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                onClickAddon(i, name, event.target.checked)
                              }
                              name={name}
                              color='primary'
                            />
                          }
                          label={name}
                        />
                      )
                    }
                    {
                      ag.limit && addonCounts[i] > ag.limit ?
                        <Typography color='error'>
                          Can only pick {ag.limit}
                        </Typography>
                      :
                        <Button
                          variant='outlined'
                          onClick={onClickNextAddon}
                        >
                          Next
                        </Button>
                    }
                  </FormGroup>
                ))
              }
            </FormControl>
          }
        </Paper>
      </Popover>
      <Popover
        open={Boolean(descAnchor)}
        anchorEl={descAnchor}
        onClose={() => setDescAnchor(null)}
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
          <Typography variant='body1'>
            {desc}
          </Typography>
        </Paper>
      </Popover>
      <ClickAwayListener onClickAway={closeTooltip}>
        <Tooltip
          arrow
          disableFocusListener
          disableHoverListener
          disableTouchListener
          onClose={closeTooltip}
          open={isTooltipOpen}
          title='Added'
          enterDelay={500}
          leaveDelay={200}
        >
          <div className={classes.scaler} onClick={onClickAdd}>
            {
              meal.img ?
                <CardMedia
                  className={classes.img}
                  image={meal.img}
                  title={meal.img}
                >
                  <AddBoxIcon className={classes.imgAdd} />
                </CardMedia>
                :
                <Typography>
                  No picture
                </Typography>
            }
          </div>
        </Tooltip>
      </ClickAwayListener>
      <CardContent className={classes.content} onClick={e => onClickContent(e, meal.description)}>
        <Typography
          variant='body1'
          className={classes.title}
        >
          {meal.name}
        </Typography>
        <Typography
          gutterBottom
          variant='body2'
          className={classes.title}
        >
          ${(meal.price / 100).toFixed(2)}
        </Typography>
        {
          isMdAndUp &&
          <Typography
            variant='caption'
            color='textSecondary'
            className={classes.desc}
          >
            {meal.description && <HelpOutlineIcon className={classes.detail} />} {meal.description}
          </Typography>
        }
      </CardContent>
    </Card>
  )
}

export default React.memo(MenuMeal);