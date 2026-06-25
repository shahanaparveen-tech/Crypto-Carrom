import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';

import { Button, TextField, Logo } from '@shared/components';
import { getApiErrorMessage } from '@shared/services/http';
import { ROUTES } from '@app/config/routes.constants';
import { registerSchema, type RegisterValues } from '../validations/auth.schema';
import { useRegister } from '../hooks';

export const RegisterPage = (): JSX.Element => {
  const navigate = useNavigate();
  const signup = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = handleSubmit(async (values) => {
    await signup.mutateAsync(values);
    navigate(ROUTES.LOBBY, { replace: true });
  });

  return (
    <div>
      <div className="mb-6 flex justify-center">
        <Logo />
      </div>
      <h1 className="mb-1 text-center font-display text-xl font-bold text-felt">Create account</h1>
      <p className="mb-6 text-center text-sm text-felt/60">Get 1,000 coins to start playing</p>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Username"
          autoComplete="username"
          error={errors.username?.message}
          {...register('username')}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <TextField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {signup.isError && (
          <p className="rounded-lg bg-coin-queen/15 px-3 py-2 text-sm text-coin-queen">
            {getApiErrorMessage(signup.error, 'Could not create account')}
          </p>
        )}

        <Button type="submit" fullWidth size="lg" isLoading={signup.isPending}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-felt/70">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="font-semibold text-gold-light hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
