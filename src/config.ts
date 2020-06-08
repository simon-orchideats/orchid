const env = process.env.NODE_ENV;

type config = {
  client: {
    app: {
      url: string,
    },
    auth: {
      domain: string,
      clientId: string,
      audience: string,
    },
    stripe: {
      key: string,
    },
    logRocket: {
      key: string;
    },
    analytics: {
      amplitude: {
        key: string
      },
      ga: {
        trackingId: string
      },
      facebookPixel: {
        pixelId: string
      }
    },
  },
  server: {
    app: {
      port: number,
      url: string,
    },
    auth: {
      domain: string,
      clientId: string,
      audience: string,
      secret: string,
      managementSecret: string,
      managementClientId: string,
      publicKey: string,
    },
    elastic: {
      node: string,
      auth: {
        username?: string,
        password?: string,
      }
    },
    mailChimp: {
      key: string,
      audienceId: string,
      dataCenter: string
    },
    geo: {
      key: string
    },
    sentry: {
      dsn: string,
    },
    stripe: {
      key: string
      hookSecret: string
    },
  }
}

const devUrl = 'http://localhost:8443';

const development: config = {
  client: {
    app: {
      url: devUrl,
    },
    auth: {
      domain: 'orchideats-dev.auth0.com',
      clientId: 'el63cM5rBcTbDSHRubPkc02pxYUsNiLU',
      audience: 'https://orchideats.com',
    },
    stripe: {
      key: 'pk_test_oWhC33Y3nSyfngzNkRlD3Qo800JmKvXEWQ',
    },
    logRocket: {
      // key: 'ugxrrj/orchid-dev',
      key: '',
    },
    analytics: {
      amplitude: {
        //key: 'd9a3d86674a064af5f76e222fba9bad6',
         key: '',
      },
      ga: {
        // trackingId: 'UA-158803692-1',
        trackingId: '',
      },
      facebookPixel: {
        pixelId: '254026399032356'
      }
    },
  },
  server: {
    app: {
      port: 8443,
      url: devUrl,
    },
    auth: {
      domain: 'orchideats-dev.auth0.com',
      clientId: 'el63cM5rBcTbDSHRubPkc02pxYUsNiLU',
      audience: 'https://orchideats.com',
      secret: process.env.AUTH_SECRET!,
      managementClientId: 'xofNOKgLq75hICbjLJHOhFJhP0E33tS5',
      managementSecret: process.env.AUTH_MANAGEMENT_SECRET!,
      publicKey: `-----BEGIN CERTIFICATE-----
MIIDCzCCAfOgAwIBAgIJIvWpk3ZK/P/hMA0GCSqGSIb3DQEBCwUAMCMxITAfBgNV
BAMTGG9yY2hpZGVhdHMtZGV2LmF1dGgwLmNvbTAeFw0yMDAzMTUxNjUzNTBaFw0z
MzExMjIxNjUzNTBaMCMxITAfBgNVBAMTGG9yY2hpZGVhdHMtZGV2LmF1dGgwLmNv
bTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAOSP7zSMYDef23npvbse
bQtoLgkX1y8R0XMtP7LLCJAZRAlAYlzim13RB02C9ynTfn6pAswWImnQl5+6q0Id
G0rFJGel53ypeCRnycFwlmdL4OGzgBrSGtfMxuS1nFhdWa6d64Ww0I9TnlMhS1mX
7z+BzmE8JgLNW5mMq8OICNOcnhVogVyqs0oZfElHS7kQjwFndV2XcIXJsutmFr73
lues01BPb/T+9rzN2duCc9l5kTMxQplXCbox8nOxFxPgfUFlGc1TcaI0McSgYsff
qVdtQ69ysJFTazId3wX/HjQPviCsygCmaYfCZeL0vswfwGlwsEPL8WgS6mzaexD9
R20CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUWeAPEdzjixHZ
8t201fah4XC9lKcwDgYDVR0PAQH/BAQDAgKEMA0GCSqGSIb3DQEBCwUAA4IBAQC5
AbPxNir33wEwIh35UNAnPlBDgHSZac6hp4XCMk5yi4BtLcFl9rM2Ql5skMwsTit5
ZXU6qqxyur6coBc5JqHHf8dyxrLiV7fWVCcrlh8BFKynCHHEdbG4etJuiJ5MxUs0
Tb5pr9qgoHZ68UZecfkNE/7GTeD6oYOEK97ngfHhm30YcKO4Bry2fgid9kVTqe1B
XT1mRLTu7eDPKJ7x5feNGoW/8O//fmBYhyCXnkh330F6EZOpbLqf41YhozSEOFcT
W8K7/eskjgjSHSz4k0wffqcCKQk3Y191a7sQs2AngocRIWeg4i+hqtoX/dHoYbJd
2/WSrrgWXTxymZWXqJ/h
-----END CERTIFICATE-----      
`,
    },
    elastic: {
      node: 'http://localhost:9200',
      auth: {
        username: undefined,
        password: undefined,
      }
    },
    mailChimp: {
      key: process.env.MAIL_CHIMP_KEY!,
      audienceId: '8646b559dc',
      dataCenter: 'us18'
    },
    stripe: {
      key: process.env.STRIPE_KEY!,
      hookSecret: process.env.STRIPE_HOOK_SECRET!
    },
    sentry: {
      // dsn: 'https://a21059ea44684e83b12fe9bacb58c567@sentry.io/4754134',
      dsn: '',
    },
    geo: {
      key: process.env.GEO_KEY!
    }
  }
};


const stageUrl = 'https://orchid-stage.herokuapp.com';

const stage: config = {
  client: {
    app: {
      url: stageUrl,
    },
    auth: {
      domain: 'orchideats-dev.auth0.com',
      clientId: 'el63cM5rBcTbDSHRubPkc02pxYUsNiLU',
      audience: 'https://orchideats.com',
    },
    stripe: {
      key: 'pk_test_oWhC33Y3nSyfngzNkRlD3Qo800JmKvXEWQ',
    },
    logRocket: {
      key: 'ugxrrj/orchid-dev',
      // key: '',
    },
    analytics: {
      amplitude: {
        //key: 'd9a3d86674a064af5f76e222fba9bad6',
         key: '',
      },
      ga: {
        // trackingId: 'UA-158803692-1',
        trackingId: '',
      },
      facebookPixel: {
        pixelId: ''
      }
    },
  },
  server: {
    app: {
      port: parseInt(process.env.PORT || '8443', 10),
      url: stageUrl,
    },
    auth: {
      domain: 'orchideats-dev.auth0.com',
      clientId: 'el63cM5rBcTbDSHRubPkc02pxYUsNiLU',
      audience: 'https://orchideats.com',
      secret: process.env.AUTH_SECRET!,
      managementClientId: 'xofNOKgLq75hICbjLJHOhFJhP0E33tS5',
      managementSecret: process.env.AUTH_MANAGEMENT_SECRET!,
      publicKey: `-----BEGIN CERTIFICATE-----
MIIDCzCCAfOgAwIBAgIJIvWpk3ZK/P/hMA0GCSqGSIb3DQEBCwUAMCMxITAfBgNV
BAMTGG9yY2hpZGVhdHMtZGV2LmF1dGgwLmNvbTAeFw0yMDAzMTUxNjUzNTBaFw0z
MzExMjIxNjUzNTBaMCMxITAfBgNVBAMTGG9yY2hpZGVhdHMtZGV2LmF1dGgwLmNv
bTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAOSP7zSMYDef23npvbse
bQtoLgkX1y8R0XMtP7LLCJAZRAlAYlzim13RB02C9ynTfn6pAswWImnQl5+6q0Id
G0rFJGel53ypeCRnycFwlmdL4OGzgBrSGtfMxuS1nFhdWa6d64Ww0I9TnlMhS1mX
7z+BzmE8JgLNW5mMq8OICNOcnhVogVyqs0oZfElHS7kQjwFndV2XcIXJsutmFr73
lues01BPb/T+9rzN2duCc9l5kTMxQplXCbox8nOxFxPgfUFlGc1TcaI0McSgYsff
qVdtQ69ysJFTazId3wX/HjQPviCsygCmaYfCZeL0vswfwGlwsEPL8WgS6mzaexD9
R20CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUWeAPEdzjixHZ
8t201fah4XC9lKcwDgYDVR0PAQH/BAQDAgKEMA0GCSqGSIb3DQEBCwUAA4IBAQC5
AbPxNir33wEwIh35UNAnPlBDgHSZac6hp4XCMk5yi4BtLcFl9rM2Ql5skMwsTit5
ZXU6qqxyur6coBc5JqHHf8dyxrLiV7fWVCcrlh8BFKynCHHEdbG4etJuiJ5MxUs0
Tb5pr9qgoHZ68UZecfkNE/7GTeD6oYOEK97ngfHhm30YcKO4Bry2fgid9kVTqe1B
XT1mRLTu7eDPKJ7x5feNGoW/8O//fmBYhyCXnkh330F6EZOpbLqf41YhozSEOFcT
W8K7/eskjgjSHSz4k0wffqcCKQk3Y191a7sQs2AngocRIWeg4i+hqtoX/dHoYbJd
2/WSrrgWXTxymZWXqJ/h
-----END CERTIFICATE-----      
`,
    },
    elastic: {
      node: 'https://dcc89395653441afa3d95a22100c9146.us-east-1.aws.found.io:9243',
      auth: {
        username: 'elastic',
        password: process.env.ELASTIC_PASS,
      }
    },
    mailChimp: {
      key: process.env.MAIL_CHIMP_KEY!,
      audienceId: '8646b559dc',
      dataCenter: 'us18'
    },
    stripe: {
      key: process.env.STRIPE_KEY!,
      hookSecret: process.env.STRIPE_HOOK_SECRET!
    },
    sentry: {
      dsn: 'https://a21059ea44684e83b12fe9bacb58c567@sentry.io/4754134',
      // dsn: '',
    },
    geo: {
      key: process.env.GEO_KEY!
    }
  }
};

const prodUrl = 'https://orchideats.com';

const production: config = {
  client: {
    app: {
      url: prodUrl,
    },
    auth: {
      domain: 'orchideats.auth0.com',
      clientId: 'xjM2bZ6zvBl6u4OzjDRGxeAV5hvZQHOK',
      audience: 'https://orchideats.com',
    },
    stripe: {
      key: 'pk_live_ssYCk7PkKuv7b817RsAnJnsZ00dDcwl5JM',
    },
    logRocket: {
      key: 'ugxrrj/orchid',
    },
    analytics: {
      amplitude: {
        key: '44271bae89e13f6bd61918d52b14b5c9',
      },
      ga: {
        trackingId: 'UA-158791511-1',
      },
      facebookPixel: {
        pixelId: '701753510614691'
      }
    },
  },
  server: {
    app: {
      port: parseInt(process.env.PORT || '8443', 10),
      url: 'https://orchideats.com',
    },
    auth: {
      domain: 'orchideats.auth0.com',
      clientId: 'xjM2bZ6zvBl6u4OzjDRGxeAV5hvZQHOK',
      audience: 'https://orchideats.com',
      secret: process.env.AUTH_SECRET!,
      managementClientId: 'OVMLHOh8thZWyX695SXYAO1CvJ2E1pVw',
      managementSecret: process.env.AUTH_MANAGEMENT_SECRET!,
      publicKey: `-----BEGIN CERTIFICATE-----
MIIDAzCCAeugAwIBAgIJdtXnFEGQrHtaMA0GCSqGSIb3DQEBCwUAMB8xHTAbBgNV
BAMTFG9yY2hpZGVhdHMuYXV0aDAuY29tMB4XDTIwMDMxNTE2NTM0MFoXDTMzMTEy
MjE2NTM0MFowHzEdMBsGA1UEAxMUb3JjaGlkZWF0cy5hdXRoMC5jb20wggEiMA0G
CSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDJADnSv2ZTEF9Ogp42AWzGuDI7pMr3
BKULVVw0LRrGbnnXTruWYsoVi5zQy9Etm5Dd5L+y1olCpk5z1IE9o9cfUizeNRTk
Kcu5OZo9AHr3fiUTekRs/z3yD1shJPU32b0WmPr2tPUvcUTENfx7YEbq3z1uaIMp
I2nhZlofCNgcVs/zgUOSA1/6XcHtkda9I/aD167a1Xm7EC1t8lpq7PHJCS8Zb3Yi
POSMSyEJxDsw2UsU5DoCtNvBu+vNFyP2LE66b3yMxuLSSPhIcqmYTZXLD/35dnVo
JMceyn06gAfeVisuKSsErXuDUHGmk0epjOqjjgYamZzFaPMdTOWzrz/ZAgMBAAGj
QjBAMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFJIB/3JXCP0/dQRo51LRmcSa
R/yUMA4GA1UdDwEB/wQEAwIChDANBgkqhkiG9w0BAQsFAAOCAQEALpziR9s5wsml
YuK2hVyA5Ftjir9H1SKr+fE/A9JTJlletX3gyl+9l1rcjMLm8wtdQ6KIidBRV7IV
hKzxpEYDHPmGkNiYPycpbM6X6mQ4j+5NKvFlJ2sDX3z5O9fCpSNofMWj/HGExiC+
vSew4L/i6dbzBOCzmrigLtzyqpIa/jDMbWoj7PV5LNxPuLR4z1a3BssW7VYYavfq
K9iDSwnGyysGsDPn0tkAYa+FNSZ9KzbC7peZ2OnXQOF19TP3yB1PoDW/fLXu4hQF
4QmCN+vJ6FB/jY2si61hGEoVl95zA8NOgfyONFp8193a5Pzg3nyQL/liC6WTP0O4
D8hc31R0UA==
-----END CERTIFICATE-----`
    },
    elastic: {
      node: 'https://a153191553584841a3c930b758f559c6.us-east-1.aws.found.io:9243',
      auth: {
        username: 'elastic',
        password: process.env.ELASTIC_PASS,
      }
    },
    mailChimp: {
      key: process.env.MAIL_CHIMP_KEY!,
      audienceId: 'a58d64a3e9',
      dataCenter: 'us19'
    },
    stripe: {
      key: process.env.STRIPE_KEY!,
      hookSecret: process.env.STRIPE_HOOK_SECRET!
    },
    sentry: {
      dsn: 'https://75d82331aa704ff0b641a0c11660d7ac@sentry.io/4741736',
    },
    geo: {
      key: process.env.GEO_KEY!
    }
  },
};

const getConfig = (env?: string) => {
  if (env === 'development') {
    console.log('running development');
    return development;
  } else if (env === 'stage') {
    console.log('running stage');
    return stage;
  } else if (env === 'production') {
    console.log('running production');
    return production;
  }
  console.log('running development');
  return development;
}

const activeConfig = getConfig(env);
const isProd = activeConfig === production;
const isStage = activeConfig === stage;
const isDev = activeConfig === development;

export {
  isProd,
  isStage,
  isDev,
  activeConfig,
}
