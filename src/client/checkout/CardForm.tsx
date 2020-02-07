import React from 'react';
import TextFieldWithStripeElement from './TextFieldWithStripeElement';
import { CardCVCElement, CardExpiryElement, CardNumberElement } from 'react-stripe-elements';
import { Grid } from '@material-ui/core';

const CardForm: React.FC = () => (
  <Grid container spacing={2}>
    <Grid item xs={12}>
      <TextFieldWithStripeElement StripeElement={CardNumberElement} label='Number' />
    </Grid>
    <Grid item xs={12} md={6}>
      <TextFieldWithStripeElement StripeElement={CardExpiryElement} label='Expiry' />
    </Grid>
    <Grid item xs={12} md={6}>
      <TextFieldWithStripeElement StripeElement={CardCVCElement} label='CVC' />
    </Grid>
  </Grid>
);

export default CardForm;
