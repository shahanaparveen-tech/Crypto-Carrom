import type { Response } from 'express';

import { env, isProduction } from '../../app/config/env';
import { COOKIE_NAMES, REFRESH_TOKEN_MAX_AGE_MS } from '../constants';

const baseOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ('none' as const) : ('lax' as const),
  path: '/',
  // Browsers reject an explicit `localhost` domain; omit it in that case.
  ...(env.COOKIE_DOMAIN && env.COOKIE_DOMAIN !== 'localhost' ? { domain: env.COOKIE_DOMAIN } : {}),
};

export const setRefreshCookie = (res: Response, token: string): void => {
  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, token, {
    ...baseOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
  });
};

export const clearRefreshCookie = (res: Response): void => {
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, baseOptions);
};
