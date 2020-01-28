const env = process.env.NODE_ENV;

type config = {
  app: {
    port: number
  }
}

const development: config = {
  app: {
    port: 8443,
  },
};

const production: config = {
  app: {
    port: parseInt(process.env.PORT || '8443', 10)
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
