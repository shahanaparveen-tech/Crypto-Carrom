import { Router } from 'express';

import { authController } from '../controller/auth.controller';
import { guestController } from '../controller/guest.controller';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../validations/auth.validation';
import { validate, authenticate, authRateLimiter } from '../../../app/middlewares';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

export const authRouter = Router();

// ---- Guest (no credentials — instant play) ----
authRouter.post('/guest', authRateLimiter, asyncHandler(guestController.login));

authRouter.post(
  '/register',
  authRateLimiter,
  validate({ body: registerSchema }),
  asyncHandler(authController.register),
);

authRouter.post(
  '/login',
  authRateLimiter,
  validate({ body: loginSchema }),
  asyncHandler(authController.login),
);

authRouter.post('/refresh', asyncHandler(authController.refresh));
authRouter.post('/logout', asyncHandler(authController.logout));

authRouter.post(
  '/verify-email',
  validate({ body: verifyEmailSchema }),
  asyncHandler(authController.verifyEmail),
);

authRouter.post(
  '/forgot-password',
  authRateLimiter,
  validate({ body: forgotPasswordSchema }),
  asyncHandler(authController.forgotPassword),
);

authRouter.post(
  '/reset-password',
  authRateLimiter,
  validate({ body: resetPasswordSchema }),
  asyncHandler(authController.resetPassword),
);

// ---- Authenticated ----
authRouter.get('/me', authenticate, asyncHandler(authController.me));
authRouter.post('/logout-all', authenticate, asyncHandler(authController.logoutAll));
authRouter.post(
  '/resend-verification',
  authenticate,
  asyncHandler(authController.resendVerification),
);
