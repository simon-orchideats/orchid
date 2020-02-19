const env = process.env.NODE_ENV;

type config = {
  authorization: {
    domain: string,
    clientId: string,
    scope: string,
    audience: string,
  },
  client: {
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
  authorization: {
    domain: 'https://foodflick.auth0.com',
    clientId: 'yB4RJFwiguCLo0ATlr03Z1fnFjzc30Wg',
    scope: 'offline_access',
    audience: 'https://saute.com',
  },
  client: {
    stripe: {
      key: 'pk_test_oWhC33Y3nSyfngzNkRlD3Qo800JmKvXEWQ',
    },
    logRocket: {
      key: '',
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
      port: 8443,
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
  authorization: {
    domain: 'https://foodflick.auth0.com',
    clientId: 'yB4RJFwiguCLo0ATlr03Z1fnFjzc30Wg',
    scope: 'offline_access',
    audience: 'https://saute.com',
  },
  client: {
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
        trackingId: 'UA-158791511-1',
      }
    },
  },
  server: {
    app: {
      port: parseInt(process.env.PORT || '8443', 10)
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
