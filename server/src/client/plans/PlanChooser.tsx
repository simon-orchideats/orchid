// import { makeStyles } from '@material-ui/core';
import withClientApollo from '../global/utils/withClientApollo';
import { isServer } from '../global/utils/isServer';

// const useStyles = makeStyles(theme => ({
// }));

const PlanChooser = () => {
  if (isServer()) return null;
  return (<div></div>);
}

export default withClientApollo(PlanChooser)
