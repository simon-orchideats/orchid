import { makeStyles, InputLabel, Select, MenuItem, FormControl } from "@material-ui/core";
import { useState, useEffect } from "react";
import { useGetAvailablePlans } from "../../plan/planService";
import { useGetCart, useUpdateCartPlanId } from "../global/state/cartState";
import withClientApollo from "../utils/withClientApollo";

const useStyles = makeStyles(() => ({
  stretch: {
    width: '100%',
  },
}));

const menu = () => {
  const classes = useStyles()
  const cart = useGetCart();
  const sortedPlans = useGetAvailablePlans();
  const defaultPlan = cart && cart.StripePlanId ? cart.StripePlanId : ''
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(defaultPlan);
  const setCartStripePlanId = useUpdateCartPlanId();
  const updatePlanId = (planId: string) => {
    setCartStripePlanId(planId);
    setSelectedPlanId(planId);
  };
  useEffect(() => {
    if ((!cart || !cart.StripePlanId) && sortedPlans.data) {
      updatePlanId(sortedPlans.data[0].StripeId);
    }
  }, [sortedPlans.data]);
  return (
    <FormControl variant='filled' className={classes.stretch}>
      <InputLabel>
        Plan
      </InputLabel>
      <Select
        value={selectedPlanId}
        onChange={e => updatePlanId(e.target.value as string)}
      >
        {sortedPlans.data && sortedPlans.data.map(plan => (
          <MenuItem key={plan.StripeId} value={plan.StripeId}>
            {plan.MealCount} (${plan.MealPrice.toFixed(2)} ea)
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )  
}

export default withClientApollo(menu);
