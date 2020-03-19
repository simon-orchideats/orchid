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
    },
    elastic: {
      node: string,
      auth: {
        username?: string,
        password?: string,
      }
    },
    geo: {
      key: string
    },
    sentry: {
      dsn: string,
    },
    stripe: {
      key: string
    },
  }
}

const devUrl = 'http://localhost:8443';
const prodUrl = 'https://orchideats.com';

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
      key: 'ugxrrj/orchid-dev',
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
      url: devUrl,
    },
    auth: {
      domain: 'orchideats-dev.auth0.com',
      clientId: 'el63cM5rBcTbDSHRubPkc02pxYUsNiLU',
      audience: 'https://orchideats.com',
      secret: process.env.AUTH_SECRET!,
      managementClientId: 'xofNOKgLq75hICbjLJHOhFJhP0E33tS5',
      managementSecret: process.env.AUTH_MANAGEMENT_SECRET!,
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
    sentry: {
      dsn: 'https://a21059ea44684e83b12fe9bacb58c567@sentry.io/4754134',
    },
    geo: {
      key: process.env.GEO_KEY!
    }
  }
};

const production: config = {
  client: {
    app: {
      url: prodUrl,
    },
    auth: {
      domain: 'foodflick.auth0.com',
      clientId: 'yB4RJFwiguCLo0ATlr03Z1fnFjzc30Wg',
      audience: 'https://saute.com',
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
      domain: 'foodflick.auth0.com',
      clientId: 'yB4RJFwiguCLo0ATlr03Z1fnFjzc30Wg',
      audience: 'https://saute.com',
      secret: process.env.AUTH_SECRET!,
      managementClientId: 'xofNOKgLq75hICbjLJHOhFJhP0E33tS5',
      managementSecret: process.env.AUTH_MANAGEMENT_SECRET!,
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
