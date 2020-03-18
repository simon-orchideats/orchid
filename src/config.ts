const env = process.env.NODE_ENV;

type config = {
  client: {
    app: {
      url: string,
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
      }
    },
  },
  server: {
    app: {
      port: number
      url: string
    },
    auth: {
      domain: string,
      clientId: string,
      audience: string,
      redirect: string,
      secret: string,
      public: string,
    },
    elastic: {
      node: string,
      auth: {
        username?: string,
        password?: string,
      }
    },
    stripe: {
      key: string
    },
    geo: {
      key: string
    }
  }
}

const development: config = {
  client: {
    app: {
      url: 'http://localhost:8443',
    },
    stripe: {
      key: 'pk_test_oWhC33Y3nSyfngzNkRlD3Qo800JmKvXEWQ',
    },
    logRocket: {
      key: '',
    },
    analytics: {
      amplitude: {
        // key: '5437afb3d48e3f34441c41e9295261ac',
        key: '',
      },
      ga: {
        // trackingId: 'UA-158803692-1',
        trackingId: '',
      }
    },
  },
  server: {
    app: {
      port: 8443,
      url: 'http://localhost:8443',
    },
    auth: {
      domain: 'https://orchideats-dev.auth0.com',
      clientId: 'el63cM5rBcTbDSHRubPkc02pxYUsNiLU',
      audience: 'https://orchideats.com',
      redirect: 'http://localhost:8443/auth-callback',
      secret: process.env.AUTH_SECRET!,
      public: `-----BEGIN CERTIFICATE-----
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
    stripe: {
      key: process.env.STRIPE_KEY!
    },
    geo: {
      key: process.env.GEO_KEY!
    }
  }
};

const production: config = {
  client: {
    app: {
      url: 'https://orchideats.com',
    },
    stripe: {
      key: 'pk_test_oWhC33Y3nSyfngzNkRlD3Qo800JmKvXEWQ',
    },
    logRocket: {
      key: 'ugxrrj/orchid',
    },
    analytics: {
      amplitude: {
        key: '5437afb3d48e3f34441c41e9295261ac',
      },
      ga: {
        trackingId: 'UA-158803692-1',
      }
    },
  },
  server: {
    app: {
      port: parseInt(process.env.PORT || '8443', 10),
      url: 'https://orchideats.com',
    },
    auth: {
      domain: 'https://foodflick.auth0.com',
      clientId: 'yB4RJFwiguCLo0ATlr03Z1fnFjzc30Wg',
      audience: 'https://saute.com',
      redirect: 'https://orchideats.com/auth-callback',
      secret: process.env.AUTH_SECRET!,
      public: `-----BEGIN CERTIFICATE-----
      MIIDATCCAemgAwIBAgIJLREMbwE8DeepMA0GCSqGSIb3DQEBCwUAMB4xHDAaBgNV
      BAMTE2Zvb2RmbGljay5hdXRoMC5jb20wHhcNMTgwMjAyMjIzMjA0WhcNMzExMDEy
      MjIzMjA0WjAeMRwwGgYDVQQDExNmb29kZmxpY2suYXV0aDAuY29tMIIBIjANBgkq
      hkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxNuO8QYUqRESqXaEzNdSxH+Jvs0d7l4N
      oVzZENIw0/D0AdF75CdYB2+Mi7Xz/WO8iZfGEeoyjXTG4RNERFiUL99Bi8GgjieI
      nimyFJH7db0ddiVQpcLDoIbgF0+PQH6PtAePKdXsfqQB2pT9w7nBYksLJerP333a
      ZcxQps1rt9hKm4W03pdrEz+xSZj9sWB6Wf4molPZyfESPBROlw4dk2Dj63GANvgc
      XoGoBrORgRRoaJnAORPXPJezkViBjTFDc0pEwCBBEI3/lVtp/JbozWJaqu3tfQCr
      5w7oyj8/tP5MiwJPGpjLg9bnw6B4pBrWfXwMP3m3kTrqupvE/W3cIwIDAQABo0Iw
      QDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBRznsMCp6w8rkifGSAjan9qppUM
      YTAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAErwXe9nKeAi97MK
      w180YFqmeNSZte8dm7RzPvw1iUsAN1QF5gToGmvxHXwpuBAZs0aE7M89KyOWqmEw
      v1IiUjrem/VR0n4Saa1LkB/AKXb9x/O7QeZxfkEV/LE0W1z5XU2ZrWQZuyLfKkdu
      aQx4EHqH/bQYY/91mOWJB/UYmReDpmZ5xNKXLnU05fX5CF8W3OFwpdk0Eg08r8++
      m276/KnLks6VjskEbEhyAj8vYIrXI591DBRsNDH4mffOKUJdKT0MP4Ze17tu0mPC
      HH5LD0RE9irb3gEn+BFMOd2JyMbddf2HiFIiPErw+LhDoWr2jpmFc6tIieDm8Fcj
      CAXO0dg=
      -----END CERTIFICATE-----
      `,
    },
    elastic: {
      node: 'https://a153191553584841a3c930b758f559c6.us-east-1.aws.found.io:9243',
      auth: {
        username: 'elastic',
        password: process.env.ELASTIC_PASS,
      }
    },
    stripe: {
      key: process.env.STRIPE_KEY!
    },
    geo: {
      key: process.env.GEO_KEY!
    }
  },
};

const getConfig = (env?: string) => {
  if (env === 'development') {
    return development;
  } else if (env === 'test') {
    return development;
  } else if (env === 'production') {
    return production;
  }
  return development;
}

const activeConfig = getConfig(env);
const isProd = activeConfig === production;
const isDev = activeConfig === development;

export {
  isProd,
  isDev,
  activeConfig,
}
