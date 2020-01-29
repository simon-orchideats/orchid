import React, { useMemo } from 'react';
import { makeStyles, ExpansionPanel, ExpansionPanelSummary, Typography, ExpansionPanelDetails, Grid } from "@material-ui/core";
import { Rest } from "../../rest/restModel";
import { useRef, useState, ChangeEvent } from "react";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MenuMeal from "./MenuMeal";

const useStyles = makeStyles(theme => ({
  restTitle: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(1),
  },
}))

type props = {
  cartRestId: string | null
  rest: Rest
}

const RestMenu: React.FC<props> = ({
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

  const meals = useMemo(() => rest.Menu.map(meal => (
    <Grid
      item
      key={meal.Id}
      xs={6}
      sm={4}
      lg={3}
    >
      <MenuMeal
        disabled={cartRestId ? cartRestId !== rest.Id : false}
        restId={rest.Id}
        meal={meal} 
      />
    </Grid>
  )), [rest.Menu, disabled])

  const forceToggle = (_e: ChangeEvent<{}>, newExpansion: boolean) => {
    lastChangeWasManual.current = true;
    setExpanded(newExpansion);
  }
  return (
    <ExpansionPanel expanded={expanded} onChange={forceToggle} TransitionProps={{ unmountOnExit: true }}>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant='h4' className={classes.restTitle}>
          {rest.Profile.Name}
        </Typography>
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
