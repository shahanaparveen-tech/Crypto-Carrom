import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { Button, TextField, Logo } from '@shared/components';
import { getApiErrorMessage } from '@shared/services/http';
import { ROUTES } from '@app/config/routes.constants';
import { resetPasswordSchema, type ResetPasswordValues } from '../validations/auth.schema';
import { useResetPassword } from '../hooks';

export const ResetPasswordPage = (): JSX.Element => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const reset = useResetPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: params.get('token') ?? '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    await reset.mutateAsync({ token: values.token, password: values.password });
    navigate(ROUTES.LOGIN, { replace: true });
  });

  return (
    <div>
      <div className="mb-6 flex justify-center">
        <Logo />
      </div>
      <h1 className="mb-6 text-center font-display text-xl font-bold text-felt">
        Set a new password
      </h1>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <TextField label="Reset token" error={errors.token?.message} {...register('token')} />
        <TextField
          label="New password"
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

        {reset.isError && (
          <p className="rounded-lg bg-coin-queen/15 px-3 py-2 text-sm text-coin-queen">
            {getApiErrorMessage(reset.error, 'Could not reset password')}
          </p>
        )}

        <Button type="submit" fullWidth size="lg" isLoading={reset.isPending}>
          Reset password
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-felt/70">
        <Link to={ROUTES.LOGIN} className="font-semibold text-gold-light hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
};

export default ResetPasswordPage;
