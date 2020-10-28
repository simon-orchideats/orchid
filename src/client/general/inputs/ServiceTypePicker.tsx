import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { ServiceType, ServiceTypes, DEFAULT_SERVICE_TYPE } from '../../../order/orderModel';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';
import withClientApollo from '../../utils/withClientApollo';
import { useGetCart, useSetServiceType } from '../../global/state/cartState';
import { useRouter } from 'next/router';
import { menuRoute } from '../../../pages/menu';

const useStyles = makeStyles(() => ({
  toggleButtonGroup: {
    width: '100%',
  },
}));

const ServiceTypePicker: React.FC = () => {
  const cart = useGetCart();
  const setCartServiceType = useSetServiceType();
  const router = useRouter();
  const currRoute = router.pathname;
  const classes = useStyles();
  return (
    <ToggleButtonGroup
      className={classes.toggleButtonGroup}
      exclusive
      value={cart ? cart.serviceType : DEFAULT_SERVICE_TYPE}
      onChange={(_, t: ServiceType) => {
        // d === null when selecting same day
        if (t === null) return;
        if (currRoute === menuRoute) {
          window.scrollTo({
            top: 0,
          })
        }
        setCartServiceType(t);
      }}
    >
      {Object.values(ServiceTypes).map(t => (
        <ToggleButton value={t} key={t}>
          {t} {cart && cart.serviceType === t && '✔'}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

export default withClientApollo(ServiceTypePicker);