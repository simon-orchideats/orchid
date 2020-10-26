import React, { useState } from 'react';
import { IMeal, IChoice, Meal } from "../../rest/mealModel";
import { useAddMealToCart } from "../global/state/cartState";
import { makeStyles, Card, CardMedia, CardContent, Typography, useMediaQuery, useTheme, Theme, Popover, Paper, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, FormGroup, Button, Tooltip, ClickAwayListener, Chip, Checkbox, Breadcrumbs } from "@material-ui/core";
import AddBoxIcon from '@material-ui/icons/AddBox';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { ICustomization } from '../../order/orderRestModel';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import { IDiscount } from '../../order/discountModel';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { analyticsService, events } from '../utils/analyticsService';

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
    [theme.breakpoints.up('md')]: {
      paddingTop: undefined,
    },
  },
  hover: {
    cursor: 'pointer',
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
  col: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  addonGroup: {
    display: 'flex',
    alignItems: 'center',
  },
  button: {
    padding: 0,
    color: theme.palette.text.primary
  },
  title: {
    lineHeight: 1.5,
    fontWeight: 500,
  },
  desc: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    '-webkit-line-clamp': 1,
    '-webkit-box-orient': 'vertical',
  },
  descMd: {
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
  chip: {
    backgroundColor: theme.palette.common.green,
    color: theme.palette.common.white,
  },
  discount: {
    fontWeight: 700,
  },
  icon: {
    fontSize: '1.8rem',
  },
  detail: {
    fontSize: '1rem',
    verticalAlign: 'text-top'
  },
  choiceLabel: {
    fontSize: '1.5rem',
  },
  price: {
    lineHeight: 1.5,
    fontWeight: 500,
    color: theme.palette.text.primary,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newPrice: {
    fontSize: '1rem',
    fontWeight: 700,
    color: theme.palette.common.green,
  },
  comparisonDesc: {
    paddingBottom: theme.spacing(1),
  },
}));

const MenuMeal: React.FC<{
  deliveryFee: number,
  discount: IDiscount | null,
  meal: IMeal,
  restId: string,
  restName: string,
  taxRate: number,
}> = ({
  deliveryFee,
  discount,
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
  const [optionGroupIndex, setOptionGroupIndex] = useState<number>(0);
  const [addonGroupIndex, setAddonGroupIndex] = useState<number>(0);
  const addMealToCart = useAddMealToCart();
  type addonGroupsState = {
    // each key is a {addonGroupIndex}-{addonIndex}
    [name: string]: ICustomization,
  }
  const defaultOptions = {};
  const [options, setOptions] = useState<{ [groupIndex: number]: ICustomization }>(defaultOptions);
  const defaultAddons = meal.addonGroups.reduce<addonGroupsState>((addonGroups, ag, groupIndex) => ({
    ...addonGroups,
    ...ag.addons.reduce<addonGroupsState>((addons, addon, addonIndex) => {
      addons[`${groupIndex}-${addonIndex}`] = {
        additionalPrice: addon.additionalPrice,
        quantity: 0,
        name: addon.name,
      };
      return addons;
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
        discount,
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
  const onClickContent = (event: React.MouseEvent<HTMLElement>) => {
    analyticsService.trackEvent(events.OPENED_DESCRIPTION);
    setDescAnchor(descAnchor ? null : event.currentTarget);
  };
  const updateAddon = (addonGroupIndex: number, addonIndex: number, addon: IChoice, count: 1 | -1) => {
    const currQuantity = addons[`${addonGroupIndex}-${addonIndex}`].quantity;
    if (currQuantity === undefined) {
      const err = new Error('Addon quantity is undefined');
      console.error(err.stack);
      throw err;
    }
    const newQuantity = currQuantity + count;
    setAddons({
      ...addons,
      [`${addonGroupIndex}-${addonIndex}`]: {
        additionalPrice: addon.additionalPrice,
        name: addon.name,
        quantity: newQuantity < 0 ? 0 : newQuantity,
      },
    });
    const newCount = addonCounts[addonGroupIndex] + count;
    setAddonCounts({
      ...addonCounts,
      [addonGroupIndex]: newCount < 0 ? 0 : newCount,
    });
  }
  const onClickNextAddon = () => {
    const nextIndex = addonGroupIndex + 1;
    if (nextIndex === meal.addonGroups.length) {
      addMealToCart(
        meal,
        [
          ...Object.values(options),
          ...Object.values(addons).filter(a => (a.quantity && a.quantity > 0)),
        ],
        deliveryFee,
        discount,
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

  const onClickRadio = (e: React.MouseEvent<HTMLLabelElement, MouseEvent>, selectedOption: IChoice) => {
    // prevenDefault so the event doesn't bubble up and trigger a second event callback
    e.preventDefault();
    const newGroupIndex = optionGroupIndex + 1;
    if (newGroupIndex === meal.optionGroups.length && meal.addonGroups.length === 0) {
      addMealToCart(
        meal,
        [...Object.values(options), selectedOption],
        deliveryFee,
        discount,
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

  let comparisonDesc;
  let badPrice: undefined | number;
  if (meal.comparison) {
    badPrice = Meal.getRoundedBadPrice(meal) / 100;
    comparisonDesc = `$${badPrice.toFixed(2)} at ${meal.comparison.compareTo} after fees`;
  }
  
  let goodPrice = meal.price / 100;
  if (discount && discount.percentOff) {
    goodPrice = (meal.price * (1 - discount.percentOff / 100)) / 100
  }
  const hasInfo = (meal.description || !!badPrice);
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
              {
                meal.optionGroups.map((og, i) => (
                  i === optionGroupIndex &&
                  <React.Fragment key={`og-${i}`}>
                    {
                      og.name ?
                      <FormLabel focused={false} className={classes.choiceLabel}>
                        {og.name} 
                      </FormLabel>
                      :
                      <FormLabel focused={false} className={classes.choiceLabel}>
                        Pick 1 
                      </FormLabel>
                    }
                    <RadioGroup value={options[optionGroupIndex] || false}>
                      {
                        og.options.map((option, j) =>
                          <FormControlLabel
                            key={`og-names-${j}`}
                            value={option.name}
                            control={<Radio color='primary' />}
                            label={`${option.name}${option.additionalPrice ? ` +(${(option.additionalPrice / 100).toFixed(2)})` : ''}`}
                            onClick={e => onClickRadio(e, option)}
                          />
                        )
                      }
                    </RadioGroup>
                  </React.Fragment>
                ))
              }
            </FormControl>
          }
          {
            optionGroupIndex >= meal.optionGroups.length && addonGroupIndex < meal.addonGroups.length &&
            <FormControl>
              {
                meal.addonGroups.map((ag, i) => (
                  i === addonGroupIndex &&
                  <React.Fragment key={`ag-${i}`}>
                    {
                      ag.name ?
                      <FormLabel
                        focused={false}
                        className={classes.choiceLabel} 
                        onClick={() => setAddonGroupIndex(addonGroupIndex - 1)}
                      >
                        {ag.name}
                        {meal.addonGroups[addonGroupIndex].limit && `(${meal.addonGroups[addonGroupIndex].limit})`}
                      </FormLabel>
                      :
                      <FormLabel
                        focused={false}
                        className={classes.choiceLabel} 
                        onClick={() => setAddonGroupIndex(addonGroupIndex - 1)}
                      >
                        Pick {meal.addonGroups[addonGroupIndex].limit ? `max ${meal.addonGroups[addonGroupIndex].limit}` : 'any'}
                      </FormLabel>
                    }
                    <FormGroup>
                      {
                        ag.canRepeat ?
                          ag.addons.map((addon, j) =>
                            <div key={`ag-names-${j}`} className={classes.addonGroup}>
                              <div className={classes.col}>
                                <Button
                                  className={classes.button}
                                  variant='text'
                                  onClick={() => updateAddon(i, j, addon, 1)}
                                >
                                  <AddIcon className={classes.icon} />
                                </Button>
                                <Typography variant='body1'>
                                  {addons[`${i}-${j}`].quantity}
                                </Typography>
                                <Button
                                  className={classes.button}
                                  variant='text'
                                  onClick={() => updateAddon(i, j, addon, -1)}
                                >
                                  <RemoveIcon className={classes.icon} />
                                </Button>
                              </div>
                              <Typography variant='body1'>
                                {addon.name} {addon.additionalPrice && `+($${(addon.additionalPrice / 100).toFixed(2)})`}
                              </Typography>
                            </div>
                          )
                        :
                          ag.addons.map((addon, j) => 
                            <FormControlLabel
                              key={`ag-names-${j}`}
                              control={
                                <Checkbox
                                  checked={addons[`${i}-${j}`].quantity === 1}
                                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                    updateAddon(i, j, addon, event.target.checked ? 1 : -1)
                                  }
                                  name={addon.name}
                                  color='primary'
                                />
                              }
                              label={`${addon.name}${addon.additionalPrice > 0 ? ` +($${(addon.additionalPrice / 100).toFixed(2)})` : ''}`}
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
                            color='secondary'
                            onClick={onClickNextAddon}
                          >
                            Next
                          </Button>
                      }
                    </FormGroup>
                  </React.Fragment>
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
          {
            comparisonDesc &&
            <Typography variant='body1' className={classes.comparisonDesc}>
              <i>{comparisonDesc}</i>
            </Typography>
          }
          <Typography variant='body1'>
            {meal.description}
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
      <CardContent className={`${classes.content} ${hasInfo ? classes.hover : ''}`} onClick={e => {
        if (hasInfo) onClickContent(e)
      }}>
        {
          discount &&
          <Chip
            size='small'
            className={classes.chip}
            clickable={false}
            label={
              <Typography variant='body2' className={classes.discount}>
                {discount.percentOff && `Table ${discount.percentOff}% off`}
                {discount.amountOff && `$${(discount.amountOff / 100).toFixed(2)} off order`}
                &nbsp;
              </Typography>
            }
          />
        }
        <Typography
          variant='body1'
          className={classes.title}
        >
          {hasInfo && <InfoOutlinedIcon className={classes.detail} />} {meal.name}
        </Typography>
        <Typography
          component='span'
          gutterBottom
          variant='body2'
          className={classes.price}
        >
          {
            !!badPrice ?
              <>
                <s>${badPrice.toFixed(2)}</s>&nbsp;
                <div className={classes.newPrice}>
                  ${goodPrice.toFixed(2)}
                </div>
              </>
            :
              `$${goodPrice.toFixed(2)}`
          }
        </Typography>
        <Typography
          variant='caption'
          color='textSecondary'
          className={isMdAndUp ? classes.descMd : classes.desc}
        >
          {meal.description}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default React.memo(MenuMeal);