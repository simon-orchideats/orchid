import { Container, makeStyles, Button, Typography } from "@material-ui/core";
import Faq from "../client/general/CommonQuestions";
import withClientApollo from "../client/utils/withClientApollo";
import { menuRoute } from "./menu";
import { isServer } from "../client/utils/isServer";
import { useGetCart, useUpdateTags } from "../client/global/state/cartState";
import { useGetConsumer } from "../consumer/consumerService";
import { useState, useEffect } from "react";
import { Tag, TagTypes } from "../rest/tagModel";
import { useGetTags } from "../rest/restService";
import RenewalChooser from "../client/general/RenewalChooser";
import Router, { useRouter } from 'next/router'
import { welcomePromoAmount, welcomePromoCouponId } from "../order/promoModel";
import { checkoutRoute } from "./checkout";

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingBottom: theme.spacing(4),
    paddingTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    backgroundColor: theme.palette.common.white,
  },
  border: {
    borderStyle: 'solid',
    padding: theme.spacing(1),
    width: '100%',
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(3),
  },
}));

const planAhead = () => {
  const classes = useStyles();
  const cart = useGetCart();
  const router = useRouter();
  const updateCartTags = useUpdateTags();
  const consumer = useGetConsumer();
  const [tags, setTags] = useState<Tag[]>([]);
  const allTags = useGetTags();
  const cartTags = cart ? cart.Tags : [];
  useEffect(() => {
    if (cartTags.length > 0) {
      setTags(cartTags);
      return;
    }
    if (allTags.data) {
      setTags(allTags.data);
    }
  }, [allTags.data, cartTags]);
  if (!cart) {
    if (!isServer()) Router.replace(`${menuRoute}`);
    return null;
  }
  if (consumer.data && consumer.data.Plan) {
    const err = new Error(`Consumer ${consumer.data.Id} nav'ed to future-weeks route`);
    console.warn(err.stack);
    if (!isServer()) Router.replace(`${menuRoute}`);
    return null;
  }
  const updateTags = (tags: Tag[]) => setTags(tags);
  const onNext = () => {
    updateCartTags(tags);
    const pushing = {
      pathname: checkoutRoute
    } as any;
    if (!router.query.p) {
      pushing.query = {
        p: welcomePromoCouponId,
        a: welcomePromoAmount,
      }
    }
    Router.push(pushing);
  }
  return (
    <>
      <Container className={classes.container}>
        <Typography variant='h3'>
          Plan ahead
        </Typography>
        <RenewalChooser
          allTags={allTags.data || []}
          tags={tags}
          onTagChange={tags => updateTags(tags)}
          validateCuisineRef={() => {}}
        />
        <Typography
          variant='body1'
          className={classes.border}
          align='center'
        >
          <b>
            You can always change your meals later!
          </b>
        </Typography>
        <Button
          variant='contained'
          color='primary'
          fullWidth
          disabled={tags.filter(t => t.Type === TagTypes.Cuisine).length === 0}
          onClick={onNext}
        >
          Next
        </Button>
      </Container>
      <Faq />
    </>
  )
}

export default withClientApollo(planAhead);

export const planAheadRoute = '/plan-ahead';