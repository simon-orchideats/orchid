import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  container: {
    overflowY: 'scroll',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
  },
  cart: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    position: 'sticky',
    top: theme.mixins.toolbar.height,
    height: `calc(100vh - ${theme.mixins.customToolbar.height}px)`,
    [theme.mixins.customToolbar.toolbarLandscapeQuery]: {
      height: `calc(100vh - ${theme.mixins.customToolbar.landscapeHeight}px)`,
      top: theme.mixins.customToolbar.landscapeHeight,
    },
    [theme.mixins.customToolbar.toolbarWidthQuery]: {
      height: `calc(100vh - ${theme.mixins.customToolbar.smallHeight}px)`,
      top: theme.mixins.customToolbar.smallHeight,
    },
  },
}));

const StickyDrawer: React.FC = ({ children }) => {
  const classes = useStyles();
  return (
    <div className={classes.cart}>
      <div className={classes.container}>
        {children}
      </div>
    </div>
  )
}

export default StickyDrawer;