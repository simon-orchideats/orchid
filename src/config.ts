const env = process.env.NODE_ENV;

type config = {
  client: {
    stripe: {
      key: string,
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
  }
}

const development: config = {
  client: {
    stripe: {
      key: 'pk_test_Ij3KCwOSq0LycG5DEcpvULGp00kyRcst9h',
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
  }
};

const production: config = {
  client: {
    stripe: {
      key: 'pk_test_Ij3KCwOSq0LycG5DEcpvULGp00kyRcst9h',
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
