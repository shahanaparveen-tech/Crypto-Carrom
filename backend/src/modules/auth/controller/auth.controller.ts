import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { authService } from '../service/auth.service';
import { sendSuccess } from '../../../shared/utils/apiResponse';
import { setRefreshCookie, clearRefreshCookie } from '../../../shared/helpers';
import { COOKIE_NAMES } from '../../../shared/constants';
import { UnauthorizedError } from '../../../shared/errors';
import type { SessionContext } from '../types/auth.types';

const sessionContext = (req: Request): SessionContext => ({
  userAgent: req.headers['user-agent'],
  ipAddress: req.ip,
});

const readRefreshCookie = (req: Request): string | undefined =>
  (req.cookies as Record<string, string | undefined>)?.[COOKIE_NAMES.REFRESH_TOKEN];

/**
 * HTTP layer for auth. The refresh token is delivered via an httpOnly cookie;
 * only the access token + user are returned in the JSON body.
 */
export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const result = await authService.register(req.body, sessionContext(req));
    setRefreshCookie(res, result.refreshToken);
    sendSuccess(
      res,
      { user: result.user, accessToken: result.accessToken },
      'Registered successfully',
      StatusCodes.CREATED,
    );
  },

  async login(req: Request, res: Response): Promise<void> {
    const result = await authService.login(req.body, sessionContext(req));
    setRefreshCookie(res, result.refreshToken);
    sendSuccess(res, { user: result.user, accessToken: result.accessToken }, 'Logged in');
  },

  async refresh(req: Request, res: Response): Promise<void> {
    const result = await authService.refresh(readRefreshCookie(req), sessionContext(req));
    setRefreshCookie(res, result.refreshToken);
    sendSuccess(res, { user: result.user, accessToken: result.accessToken }, 'Token refreshed');
  },

  async logout(req: Request, res: Response): Promise<void> {
    await authService.logout(readRefreshCookie(req));
    clearRefreshCookie(res);
    sendSuccess(res, null, 'Logged out');
  },

  async logoutAll(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    await authService.logoutAll(req.user.id);
    clearRefreshCookie(res);
    sendSuccess(res, null, 'Logged out of all sessions');
  },

  async me(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const user = await authService.getCurrentUser(req.user.id);
    sendSuccess(res, { user });
  },

  async verifyEmail(req: Request, res: Response): Promise<void> {
    await authService.verifyEmail(req.body.token);
    sendSuccess(res, null, 'Email verified');
  },

  async resendVerification(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    await authService.resendVerification(req.user.id);
    sendSuccess(res, null, 'Verification email sent');
  },

  async forgotPassword(req: Request, res: Response): Promise<void> {
    await authService.forgotPassword(req.body.email);
    sendSuccess(res, null, 'If that email exists, a reset link has been sent');
  },

  async resetPassword(req: Request, res: Response): Promise<void> {
    await authService.resetPassword(req.body.token, req.body.password);
    sendSuccess(res, null, 'Password reset successfully');
  },
};
