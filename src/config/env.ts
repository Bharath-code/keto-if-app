import Constants from 'expo-constants';

interface Config {
  API_BASE_URL: string;
  API_KEY: string;
  OPENAI_API_KEY: string;
  ANALYTICS_KEY: string;
  APP_ENV: 'development' | 'staging' | 'production';
  DEBUG_MODE: boolean;
}

const getConfig = (): Config => {
  const extra = Constants.expoConfig?.extra || {};

  return {
    API_BASE_URL: extra.API_BASE_URL || 'http://localhost:3000',
    API_KEY: extra.API_KEY || 'dev_api_key',
    OPENAI_API_KEY: extra.OPENAI_API_KEY || '',
    ANALYTICS_KEY: extra.ANALYTICS_KEY || '',
    APP_ENV: extra.APP_ENV || 'development',
    DEBUG_MODE: extra.DEBUG_MODE !== 'false',
  };
};

export const config = getConfig();
