import { NotificationType } from '../../notification/notificationModel';
import { createMuiTheme, Theme } from "@material-ui/core";
import { ThemeOptions } from "@material-ui/core/styles/createMuiTheme";
const floralWhite = '#ffdd40'; //'#fceaa3' // '#F1F1DB' //'#F8DF7B' //'#FABE0E';
const lightGray = '#f9f9f9'; //'#f2f7fb'//'#EEF1F6';
const charcoal = '#3c3c3c';
const leafGreen = '#538401' //'#65b10c' //'#538401'; //'#6ad080' //'#538401' // '#A3B95A'//'#538401'//'#8AB661' //'#B8E6B1' //'#89C057'; //#28590c
const blue = '#0070eb';
const white = "#ffffff";
const powerGreen = '#3d9241';
const powerOrange = '#ff7600';
const powerRed = '#f44336'
/**
 * 
 * #F0DBDB
 * #E6F0DB
 * #F1F1DB
 */
const brandBase = white;
const brandPrimary = leafGreen;
const brandSecondary = floralWhite;
const brandLink = blue;
const brandSecondaryLightOpacity = (opacity: number) => `rgba(28, 62, 8, ${opacity})`
const brandSecondaryDarkOpacity = (opacity: number) => `rgba(20, 45, 6, ${opacity})`
const brandText = charcoal;
const brandCanvas = lightGray;
const brandSuccess = powerGreen;
const brandWarning = powerOrange;
const brandError = powerRed;
const toolbarLandscapeQuery = '@media (min-width:0px) and (orientation: landscape)';
const toolbarWidthQuery = '@media (min-width:600px)'

const theme: ThemeOptions = {
  breakpoints: {
    keys: [
      'xs',
      'sm',
      'md',
      'lg',
      'xl'
    ],
    values: {
      xs: 0,
      sm: 450,
      md: 768,
      lg: 960,
      xl: 1280
    }
  },
  direction: 'ltr',
  mixins: {
    navbar: {
      marginBottom: 56,
    },
    customToolbar: {
      toolbarLandscapeQuery,
      toolbarWidthQuery,
    },
    toolbar: {
      height: 56,
      [toolbarLandscapeQuery as string]: {
        height: 48
      },
      [toolbarWidthQuery as string]: {
        height: 64
      },
    }
  },
  overrides: {
    MuiAppBar: {
      colorDefault: {
        backgroundColor: brandBase,
      },
    },
    MuiButton: {
      containedPrimary: {
        color: white,
      }
    },
    MuiContainer: {
      root: {
        backgroundColor: white
      },
    },
    MuiFilledInput: {
      root: {
        backgroundColor: white,
        '&:hover': {
          backgroundColor: white,
        },
        '&.Mui-focused': {
          backgroundColor: white,
        }
      },
      underline: {
        '&:before': {
          borderBottom: `1px solid ${brandPrimary}`
        },
        '&:after': {
          borderBottom: `2px solid ${brandPrimary}`
        },
        '&:hover:before': {
          borderBottom: `1px solid `
        },
      }
    },
    //@ts-ignore
    MuiToggleButtonGroup: {
      grouped: {
        '&:not(:first-child)': {
          borderLeft: `1px solid rgba(0, 0, 0, 0.12)`,
        }, 
      }
    },
    //@ts-ignore
    MuiToggleButton: {
      root: {
        flex: 1,
        color: brandText,
        backgroundColor: white,
        '&:hover': {
          color: brandSecondary,
          backgroundColor: brandSecondaryLightOpacity(0.87),
        },
        '&.Mui-selected:hover': {
          backgroundColor: `${brandSecondaryDarkOpacity(0.87)} !important`,
        },
        '&.Mui-selected': {
          color: white,
          backgroundColor: brandPrimary,
        },
      },
    },
  },
  palette: {
    common: {
      black: '#000',
      white: white,
      link: brandLink,
      success: brandSuccess,
      warning: brandWarning,
      error: brandError,
    },
    type: 'light',
    primary: {
      // commented out so mui auto generates light + dark
      light: '#E6F0DB',
      main: brandPrimary,
      // dark: brandPrimaryDark,
      contrastText: brandText
    },
    secondary: {
      light: '#fceaa3',
      main: brandSecondary,
      dark: '#ed8b00',
      contrastText: '#fff'
    },
    error: {
      light: '#e57373',
      main: brandError,
      dark: '#d32f2f',
      contrastText: '#fff'
    },
    warning: {
      light: '#ffb74d',
      main: '#ff9800',
      dark: '#f57c00',
      contrastText: 'rgba(0, 0, 0, 0.87)'
    },
    info: {
      light: '#64b5f6',
      main: '#2196f3',
      dark: '#1976d2',
      contrastText: '#fff'
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
      A100: '#d5d5d5',
      A200: '#aaaaaa',
      A400: '#303030',
      A700: '#616161'
    },
    contrastThreshold: 3,
    tonalOffset: 0.2,
    text: {
      primary: brandText,
      secondary: 'rgba(0, 0, 0, 0.54)',
      disabled: 'rgba(0, 0, 0, 0.38)',
      hint: 'rgba(0, 0, 0, 0.38)'
    },
    divider: 'rgba(0, 0, 0, 0.12)',
    background: {
      paper: '#fff',
      default: brandCanvas,
    },
    action: {
      active: 'rgba(0, 0, 0, 0.54)',
      hover: 'rgba(0, 0, 0, 0.08)',
      hoverOpacity: 0.08,
      selected: 'rgba(0, 0, 0, 0.14)',
      disabled: 'rgba(0, 0, 0, 0.26)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)'
    }
  },
  props: {},
  shadows: [
    'none',
    '0px 1px 3px 0px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 2px 1px -1px rgba(0,0,0,0.12)',
    '0px 1px 5px 0px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 3px 1px -2px rgba(0,0,0,0.12)',
    '0px 1px 8px 0px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 3px 3px -2px rgba(0,0,0,0.12)',
    '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
    '0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)',
    '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
    '0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.12)',
    '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
    '0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)',
    '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)',
    '0px 6px 7px -4px rgba(0,0,0,0.2),0px 11px 15px 1px rgba(0,0,0,0.14),0px 4px 20px 3px rgba(0,0,0,0.12)',
    '0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)',
    '0px 7px 8px -4px rgba(0,0,0,0.2),0px 13px 19px 2px rgba(0,0,0,0.14),0px 5px 24px 4px rgba(0,0,0,0.12)',
    '0px 7px 9px -4px rgba(0,0,0,0.2),0px 14px 21px 2px rgba(0,0,0,0.14),0px 5px 26px 4px rgba(0,0,0,0.12)',
    '0px 8px 9px -5px rgba(0,0,0,0.2),0px 15px 22px 2px rgba(0,0,0,0.14),0px 6px 28px 5px rgba(0,0,0,0.12)',
    '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)',
    '0px 8px 11px -5px rgba(0,0,0,0.2),0px 17px 26px 2px rgba(0,0,0,0.14),0px 6px 32px 5px rgba(0,0,0,0.12)',
    '0px 9px 11px -5px rgba(0,0,0,0.2),0px 18px 28px 2px rgba(0,0,0,0.14),0px 7px 34px 6px rgba(0,0,0,0.12)',
    '0px 9px 12px -6px rgba(0,0,0,0.2),0px 19px 29px 2px rgba(0,0,0,0.14),0px 7px 36px 6px rgba(0,0,0,0.12)',
    '0px 10px 13px -6px rgba(0,0,0,0.2),0px 20px 31px 3px rgba(0,0,0,0.14),0px 8px 38px 7px rgba(0,0,0,0.12)',
    '0px 10px 13px -6px rgba(0,0,0,0.2),0px 21px 33px 3px rgba(0,0,0,0.14),0px 8px 40px 7px rgba(0,0,0,0.12)',
    '0px 10px 14px -6px rgba(0,0,0,0.2),0px 22px 35px 3px rgba(0,0,0,0.14),0px 8px 42px 7px rgba(0,0,0,0.12)',
    '0px 11px 14px -7px rgba(0,0,0,0.2),0px 23px 36px 3px rgba(0,0,0,0.14),0px 9px 44px 8px rgba(0,0,0,0.12)',
    '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)'
  ],
  typography: {
    htmlFontSize: 16,
    fontFamily: '\'Raleway\', \'Helvetica\', \'Arial\', sans-serif',
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h1: {
      fontFamily: '\'Raleway\', \'Helvetica\', \'Arial\', sans-serif',
      fontWeight: 300,
      fontSize: '6rem',
      lineHeight: 1,
      letterSpacing: '-0.01562em'
    },
    h2: {
      fontFamily: '\'Raleway\', \'Helvetica\', \'Arial\', sans-serif',
      fontWeight: 300,
      fontSize: '3.75rem',
      lineHeight: 1,
      letterSpacing: '-0.00833em'
    },
    h3: {
      fontFamily: '\'Raleway\', \'Helvetica\', \'Arial\', sans-serif',
      fontWeight: 400,
      fontSize: '3rem',
      lineHeight: 1.04,
      letterSpacing: '0em'
    },
    h4: {
      fontFamily: '\'Raleway\', \'Helvetica\', \'Arial\', sans-serif',
      fontWeight: 400,
      fontSize: '2.125rem',
      lineHeight: 1.17,
      letterSpacing: '0.00735em'
    },
    h5: {
      fontFamily: '\'Raleway\', \'Helvetica\', \'Arial\', sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.33,
      letterSpacing: '0em'
    },
    h6: {
      fontFamily: '\'Raleway\', \'Helvetica\', \'Arial\', sans-serif',
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.6,
      letterSpacing: '0.0075em'
    },
    subtitle1: {
      fontFamily: '\'Raleway\', \'Helvetica\', \'Arial\', sans-serif',
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.75,
      letterSpacing: '0.00938em'
    },
    subtitle2: {
      fontFamily: '\'Raleway\', \'Helvetica\', \'Arial\', sans-serif',
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.57,
      letterSpacing: '0.00714em'
    },
    body1: {
      fontFamily: '\'Raleway\', \'Helvetica\', \'Arial\', sans-serif',
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.00938em'
    },
    body2: {
      fontFamily: '\'Raleway\', \'Helvetica\', \'Arial\', sans-serif',
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.43,
      letterSpacing: '0.01071em'
    },
    button: {
      fontFamily: '\'Raleway\', \'Helvetica\', \'Arial\', sans-serif',
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.75,
      letterSpacing: '0.02857em',
      textTransform: 'uppercase'
    },
    caption: {
      fontFamily: '\'Raleway\', \'Helvetica\', \'Arial\', sans-serif',
      fontWeight: 400,
      fontSize: '0.75rem',
      lineHeight: 1.66,
      letterSpacing: '0.03333em'
    },
    overline: {
      fontFamily: '\'Raleway\', \'Helvetica\', \'Arial\', sans-serif',
      fontWeight: 400,
      fontSize: '0.75rem',
      lineHeight: 2.66,
      letterSpacing: '0.08333em',
      textTransform: 'uppercase'
    }
  },
  shape: {
    borderRadius: 4
  },
  transitions: {
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
    },
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195
    }
  },
  zIndex: {
    mobileStepper: 1000,
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500
  }
}

declare module "@material-ui/core/colors/common" {
  interface CommonColors {
    link: string;
    [NotificationType.success]: string;
    [NotificationType.warning]: string;
    [NotificationType.error]: string;
  }
}

declare module "@material-ui/core/styles/createMixins" {
  interface Mixins {
    navbar: {
      marginBottom: number
    };
    customToolbar: {
      toolbarLandscapeQuery: string
      toolbarWidthQuery: string
    }
  }
}

let muiTheme: Theme;
const getTheme = () => {
  if (muiTheme) return muiTheme;
  //@ts-ignore
  muiTheme = createMuiTheme(theme);
  return muiTheme;
}

export {
  getTheme
}