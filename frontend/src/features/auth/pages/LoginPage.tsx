import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Button, TextField, Logo } from '@shared/components';
import { getApiErrorMessage } from '@shared/services/http';
import { ROUTES } from '@app/config/routes.constants';
import { loginSchema, type LoginValues } from '../validations/auth.schema';
import { useLogin } from '../hooks';
import { GuestLoginButton } from '../components/GuestLoginButton';

export const LoginPage = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;

  const onSubmit = handleSubmit(async (values) => {
    await login.mutateAsync(values);
    navigate(from ?? ROUTES.LOBBY, { replace: true });
  });

  return (
    <div>
      <div className="mb-6 flex justify-center">
        <Logo />
      </div>
      <h1 className="mb-1 text-center font-display text-xl font-bold text-felt">Welcome</h1>
      <p className="mb-6 text-center text-sm text-felt/60">Jump straight in — no account needed</p>

      <GuestLoginButton />

      <div className="my-6 flex items-center gap-3 text-xs text-felt/40">
        <span className="h-px flex-1 bg-gold/15" />
        or sign in with email
        <span className="h-px flex-1 bg-gold/15" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <TextField
          label="Email or username"
          autoComplete="username"
          error={errors.identifier?.message}
          {...register('identifier')}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        {login.isError && (
          <p className="rounded-lg bg-coin-queen/15 px-3 py-2 text-sm text-coin-queen">
            {getApiErrorMessage(login.error, 'Invalid credentials')}
          </p>
        )}

        <div className="text-right">
          <Link to={ROUTES.FORGOT_PASSWORD} className="text-xs text-gold-light hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="secondary" fullWidth size="lg" isLoading={login.isPending}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-felt/70">
        New here?{' '}
        <Link to={ROUTES.REGISTER} className="font-semibold text-gold-light hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
