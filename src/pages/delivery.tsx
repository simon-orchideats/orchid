import { Container, makeStyles, Typography, FormControl, InputLabel, Select, MenuItem, Button } from "@material-ui/core";
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Faq from "../client/reused/Faq";
import { useState, useRef, useEffect } from "react";
import { useUpdateDeliveryDay, useGetCart } from "../client/global/state/cartState";
import { deliveryDay } from "../consumer/consumerModel";
import withClientApollo from "../client/utils/withClientApollo";
import Link from "next/link";
import { checkoutRoute } from "./checkout";
import Router from 'next/router'
import { menuRoute } from "./menu";
import { isServer } from "../client/utils/isServer";

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'none',
    paddingBottom: theme.spacing(4),
  },
  header: {
    paddingBottom: theme.spacing(4),
  },
  largePaddingBottom: {
    paddingBottom: theme.spacing(4),
  },
  smallPaddingBottom: {
    paddingBottom: theme.spacing(2),
  },
  toggleButtonGroup: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  input: {
    alignSelf: 'stretch',
  },
  row: {
    display: 'flex',
  },
}));

const delivery = () => {
  const classes = useStyles();
  const [day, setDay] = useState<deliveryDay>(0);
  const inputLabel = useRef<HTMLLabelElement>(null);
  const [labelWidth, setLabelWidth] = useState(0);
  const updateDeliveryDay = useUpdateDeliveryDay();
  useEffect(() => {
    setLabelWidth(inputLabel.current!.offsetWidth);
  }, []);
  const cart = useGetCart();
  if (!cart && !isServer()) Router.replace(`/${menuRoute}`);
  return (
    <>
      <Container className={classes.container}>
        <Typography
          variant='h3'
          color='primary'
          className={classes.header}
        >
          Choose a repeat delivery day
        </Typography>
        <ToggleButtonGroup
          className={classes.toggleButtonGroup}
          exclusive
          value={day}
          onChange={(_, d: deliveryDay) => {
            // d === null when selecting same day
            if (d === null) return;
            setDay(d)
          }}
        >
          <ToggleButton value={0}>
            Sun
          </ToggleButton>
          <ToggleButton value={3}>
            Wed
          </ToggleButton>
          <ToggleButton value={5}>
            Fri
          </ToggleButton>
        </ToggleButtonGroup>
        <FormControl variant='filled' className={`${classes.input} ${classes.smallPaddingBottom}`}>
          <InputLabel ref={inputLabel}>
            Another day
          </InputLabel>
          <Select
            labelWidth={labelWidth}
            value={day === 0 || day === 3 || day === 5 ? '' : day}
            onChange={e => setDay(e.target.value as deliveryDay)}
          >
            <MenuItem value={1}>Mon</MenuItem>
            <MenuItem value={2}>Tue</MenuItem>
            <MenuItem value={4}>Thur</MenuItem>
            <MenuItem value={6}>Sat</MenuItem>
          </Select>
        </FormControl>
        <div className={`${classes.row} ${classes.smallPaddingBottom}`}>
          <Typography variant='subtitle1'>
            First delivery:&nbsp;
          </Typography>
          <Typography variant='subtitle1'>
            12/12/12, 6pm - 9pm
          </Typography>
        </div>
        <Link href={checkoutRoute}>
          <Button
            variant='contained'
            color='primary'
            fullWidth
            onClick={() => updateDeliveryDay(day)}
          >
            Next
          </Button>
        </Link>
      </Container>
      <Faq />
    </>
  )
}

export default withClientApollo(delivery);

export const deliveryRoute = 'delivery';