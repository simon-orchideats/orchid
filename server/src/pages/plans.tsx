import { Container, makeStyles, Typography, Divider, Hidden } from "@material-ui/core";
import PlanChooser from "../client/plans/PlanChooser";
import Faq from "../client/explanations/Faq";

const useStyles = makeStyles(theme => ({
  container: {
    background: 'none',
    marginBottom: theme.spacing(8),
  },
  row: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing(5),
  },
  detail: {
    width: 200,
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3), 
  },
  title: {
    paddingBottom: theme.spacing(2)
  },
  img: {
    width: 200,
  },
  divider: {
    height: 250,
    alignSelf: 'center',
    backgroundColor: theme.palette.primary.main,
  },
  centered: {
    textAlign: 'center',
  },
}));

const Detail: React.FC<{
  img: string,
  description: string
}> = ({
  img,
  description
}) => {
  const classes = useStyles();
  return (
    <div className={`${classes.centered} ${classes.detail}`}>
      <img src={img} alt={img} className={classes.img} />
      <Typography variant='body1'>
        {description}
      </Typography>
    </div>
  )
}

const plans = () => {
  const classes = useStyles();
  return (
    <>
      <Container className={`${classes.centered} ${classes.container}`}>
        <Typography variant='h2' className={classes.title}>
          Plans
        </Typography>
        <Hidden smDown>
          <div className={classes.row}>
            <Detail
              img='plans/burrito.jpg'
              description='Meals are cooked and delivered on the same day. Ready to eat in 3 minutes.'
            />
            <Divider orientation='vertical' className={classes.divider} />
            <Detail
              img='plans/farmer.jpg'
              description='Local. Sustainable. Environmental. Support local family restaurants.'
            />
            <Divider orientation='vertical' className={classes.divider} />
            <Detail
              img='plans/bao.jpg'
              description='Try a new plan every week. Or repeat. Or Skip a week. Or cancel anytime.'
            />
          </div>
        </Hidden>
        <PlanChooser />
      </Container>
      <Faq />
    </>
  )
}

export default plans;

export const plansRoute = 'plans';