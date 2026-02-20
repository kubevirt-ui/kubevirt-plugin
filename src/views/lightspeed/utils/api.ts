import { DEFAULT_LIGHTSPEED_API_BASE_URL, OLS_API_BASE_URL } from '@lightspeed/utils/constants';

export const getAPIURL = (path: string): string => {
  const base = (OLS_API_BASE_URL || DEFAULT_LIGHTSPEED_API_BASE_URL).replace(/\/+$/, '');

  return `${base}${path}`;
};

export const QUERY_ENDPOINT = getAPIURL(`/v1/query`);

export const DEFAULT_QUERY_TIMEOUT = 2000000;
