import React, { useMemo } from 'react';
import { makeStyles, ExpansionPanel, ExpansionPanelSummary, Typography, ExpansionPanelDetails, Grid } from "@material-ui/core";
import { Rest } from "../../rest/restModel";
import { useRef, useState, ChangeEvent } from "react";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MenuMeal from "./MenuMeal";
import { DeliveryMeal } from '../../order/deliveryModel';

const useStyles = makeStyles(theme => ({
  summary: {
    paddingLeft: theme.spacing(1),
  },
}))

const RestMenu: React.FC<{
  cartRestId: string | null
  cartMeals: DeliveryMeal[]
  rest: Rest
}> = ({
  cartMeals,
  cartRestId,
  rest
}) => {
  const classes = useStyles();
  const expansionBeforeOutsideClosed = useRef(true);
  const lastChangeWasManual = useRef(false);
  const wasOutsideClosed = useRef(false); 
  const wasOutsideOpened = useRef(false); 
  const [expanded, setExpanded] = useState(true);
  const [isForcedOpen, setForcedOpen] = useState(false);

  if (cartRestId && cartRestId !== rest.Id && !wasOutsideClosed.current && !isForcedOpen) {
    expansionBeforeOutsideClosed.current = expanded;
    lastChangeWasManual.current = false;
    wasOutsideClosed.current = true;
    wasOutsideOpened.current = false;
    setExpanded(false);
  }

  if (!cartRestId) {
    wasOutsideClosed.current = false;
    if (!wasOutsideOpened.current && !lastChangeWasManual.current) {
      setExpanded(expansionBeforeOutsideClosed.current);
      wasOutsideOpened.current = true;
    }
    if (isForcedOpen) setForcedOpen(false);
  }

  const disabled = cartRestId ? cartRestId !== rest.Id : false;

  const meals = useMemo(() => rest.Menu.map(meal => {
    const index = cartMeals.findIndex(cartMeal => cartMeal.MealId === meal.Id);
    return (
      <Grid
        item
        key={meal.Id}
        xs={6}
        sm={4}
      >
        <MenuMeal
          disabled={cartRestId ? cartRestId !== rest.Id : false}
          restId={rest.Id}
          restName={rest.Profile.Name}
          meal={meal} 
          defaultCount={index === -1 ? 0 : cartMeals[index].Quantity}
        />
      </Grid>
    )
  }), [rest.Menu, disabled])

  const forceToggle = (_e: ChangeEvent<{}>, newExpansion: boolean) => {
    lastChangeWasManual.current = true;
    setExpanded(newExpansion);
  }
  return (
    <ExpansionPanel expanded={expanded} onChange={forceToggle} TransitionProps={{ unmountOnExit: true }}>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <div className={classes.summary}>
          <Typography variant='h4'>
            {rest.Profile.Name}
          </Typography>
          <Typography variant='subtitle1' color='textSecondary'>
            {rest.Location.Address.getAddrStr()}
          </Typography>
          <Typography variant='subtitle1' color='textSecondary'>
            {rest.Profile.Phone}
          </Typography>
        </div>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <Grid container>
          {meals}
        </Grid>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  )
}

export default React.memo(RestMenu);
