import { makeStyles, Container, Grid, Typography, Avatar } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  onTop: {
    zIndex: 1,
    position: 'relative',
  },
  explainations: {
    backgroundColor: theme.palette.background.default,
  },
  fruits: {
    width: 500,
    right: 50,
    position: 'absolute',
  },
  rice: {
    width: 300,
    right: 0,
    position: 'absolute',
  },
  sandwhich: {
    width: 500,
    left: 0,
    position: 'absolute',
  },
  potatoes: {
    width: 700,
    left: -20,
    position: 'absolute',
  },
  centered: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  mediumBottomMargin: {
    marginBottom: theme.spacing(2),
  },
  largeVerticalMargin: {
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(8),
  },
  largeBottomMargin: {
    marginBottom: theme.spacing(4),
  },
}))

const TextBlock: React.FC<{title: string, description: string}> = ({ title, description }) => {
  const classes = useStyles();
  return (
    <>
      <Typography variant='h4' className={classes.mediumBottomMargin}>
        {title}
      </Typography>
      <Typography variant='h6' color='textSecondary'>
        {description}
      </Typography>
    </>
  )
};
const Explanation: React.FC<{
  title: string,
  description: string,
  dividerTitle: string,
  dividerSubtitle: string,
  img: string,
  imgLeft: boolean
  imgBackground?: React.ReactNode
}> = ({
  title,
  description,
  dividerTitle,
  dividerSubtitle,
  img,
  imgLeft,
  imgBackground,
}) => {
  const classes = useStyles();
  let left;
  let right;
  const imgBlock = (
    <>
      <img src={img} className={classes.onTop} alt='logo' />
      {imgBackground}
    </>
  )
  if (imgLeft) {
    left = imgBlock
    right = (
      <TextBlock
        title={title}
        description={description}
      />
    )
  } else {
    left = (
      <TextBlock
        title={title}
        description={description}
      />
    );
    right = imgBlock
    
  }
  return (
    <>
      <Grid item xs={5} className={classes.centered}>
        {left}
      </Grid>
      <Grid item xs={2} className={classes.centered}>
        <Typography variant='h6'>{dividerTitle}</Typography>
        <Avatar>{dividerSubtitle}</Avatar>
      </Grid>
      <Grid item xs={5} className={classes.centered}>
        {right}
      </Grid>
    </>
  )
}

const HowItWorks = () => {
  const classes = useStyles();
  return (
    <div className={classes.centered}>
      <Container maxWidth='lg' className={`${classes.centered} ${classes.explainations}`}>
        <Typography variant='h2' className={classes.largeBottomMargin}>
          How it works
        </Typography>
        <Grid container>
          <Explanation
            title='Pick the meal plan'
            description='Subscribe and save! Choose 4, 8, or 12 meals per week to fit your lifestyle. Need to cancel, 
            change menus, or skip a week? Not a problem.'
            dividerTitle='Step'
            dividerSubtitle='1'
            img='/placeholder.jpg'
            imgLeft={true}
            imgBackground={<img src='/sandwhich.png' className={classes.sandwhich} alt='sandwhich' />}
          />
          <Grid item xs={12} className={classes.largeVerticalMargin} />
          <Explanation
            title='Pick the menu'
            description="Like variety? Pick a set of customized meals from a variety of your favorite local restaurants.
            Forget to choose next weeks menu? No worries. We'll renew your previous selection."
            dividerTitle='Step'
            dividerSubtitle='2'
            img='/placeholder.jpg'
            imgLeft={false}
            imgBackground={<img src='/fruits.png' className={classes.fruits} alt='fruits' />}
          />
          <Grid item xs={12} className={classes.largeVerticalMargin} />
          <Explanation
            title='Set deliviery time'
            description='Know exactly when your food arrives, no more unpredictable delivery times. Every meal is cooked
            the same day and delivered exactly when you want it.'
            dividerTitle='Step'
            dividerSubtitle='3'
            img='/placeholder.jpg'
            imgLeft={true}
            imgBackground={<img src='/potatoes.png' className={classes.potatoes} alt='potatoes' />}
          />
          <Grid item xs={12} className={classes.largeVerticalMargin} />
          <Explanation
            title='Pick the meal plan'
            description='Enjoy the meal as intended, fresh from the kitchen. No reheating. No wasteful packaging. Just
            food. Just eat.'
            dividerTitle='Step'
            dividerSubtitle='4'
            img='/placeholder.jpg'
            imgLeft={false}
            imgBackground={<img src='/rice.png' className={classes.rice} alt='rice' />}
          />
          <Grid item xs={12} className={classes.largeVerticalMargin} />
        </Grid>
      </Container>
    </div>
  )
}

export default HowItWorks;

export const howItWorksRoute = 'how-it-works';