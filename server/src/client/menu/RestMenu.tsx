import { makeStyles, ExpansionPanel, ExpansionPanelSummary, Typography, ExpansionPanelDetails, Grid } from "@material-ui/core";
import { Rest } from "../../rest/restModel";
import { useGetCart } from "../global/state/cartState";
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

const RestMenu: React.FC<{
  rest: Rest
}> = ({
  rest
}) => {
  const classes = useStyles();
  const cart = useGetCart();
  const expansionBeforeOutsideClosed = useRef(true);
  const lastChangeWasManual = useRef(false);
  const wasOutsideClosed = useRef(false); 
  const wasOutsideOpened = useRef(false); 
  const [expanded, setExpanded] = useState(true);
  const [isForcedOpen, setForcedOpen] = useState(false);

  if (cart && cart.RestId && cart.RestId !== rest.Id && !wasOutsideClosed.current && !isForcedOpen) {
    expansionBeforeOutsideClosed.current = expanded;
    lastChangeWasManual.current = false;
    wasOutsideClosed.current = true;
    wasOutsideOpened.current = false;
    setExpanded(false);
  }

  if (cart && !cart.RestId) {
    wasOutsideClosed.current = false;
    if (!wasOutsideOpened.current && !lastChangeWasManual.current) {
      setExpanded(expansionBeforeOutsideClosed.current);
      wasOutsideOpened.current = true;
    }
    if (isForcedOpen) setForcedOpen(false);
  }

  const forceToggle = (_e: ChangeEvent<{}>, newExpansion: boolean) => {
    lastChangeWasManual.current = true;
    setExpanded(newExpansion);
  }
  return (
    <ExpansionPanel expanded={expanded} onChange={forceToggle}>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant='h4' className={classes.restTitle}>
          {rest.Profile.Name}
        </Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <Grid container>
          {rest.Menu.map(meal => (
            <Grid
              item
              key={meal.Id}
              xs={6}
              sm={4}
              md={3}
            >
              <MenuMeal restId={rest.Id} meal={meal} />
            </Grid>
          ))}
        </Grid>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  )
}

export default RestMenu;