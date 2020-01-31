import { makeStyles } from "@material-ui/core";
import { CSSProperties } from "@material-ui/styles";

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
    height: `calc(100vh - ${theme.mixins.toolbar.height}px)`,
    [theme.mixins.customToolbar.toolbarLandscapeQuery]: {
      height: `calc(100vh - ${(theme.mixins.toolbar[theme.mixins.customToolbar.toolbarLandscapeQuery]! as CSSProperties).height}px)`,
      top: (theme.mixins.toolbar[theme.mixins.customToolbar.toolbarLandscapeQuery]! as CSSProperties).height,
    },
    [theme.mixins.customToolbar.toolbarWidthQuery]: {
      height: `calc(100vh - ${(theme.mixins.toolbar[theme.mixins.customToolbar.toolbarWidthQuery]! as CSSProperties).height}px)`,
      top: (theme.mixins.toolbar[theme.mixins.customToolbar.toolbarWidthQuery]! as CSSProperties).height
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