import { http } from '@shared/services/http';
import type { PublicUser } from '@shared/types/domain.types';

interface AuthPayload {
  user: PublicUser;
  accessToken: string;
}

export const authApi = {
  guest() {
    return http.post<AuthPayload>('/auth/guest');
  },
  register(body: { email: string; username: string; password: string }) {
    return http.post<AuthPayload>('/auth/register', body);
  },
  login(body: { identifier: string; password: string }) {
    return http.post<AuthPayload>('/auth/login', body);
  },
  logout() {
    return http.post<null>('/auth/logout');
  },
  me() {
    return http.get<{ user: PublicUser }>('/auth/me');
  },
  forgotPassword(email: string) {
    return http.post<null>('/auth/forgot-password', { email });
  },
  resetPassword(body: { token: string; password: string }) {
    return http.post<null>('/auth/reset-password', body);
  },
  verifyEmail(token: string) {
    return http.post<null>('/auth/verify-email', { token });
  },
};
