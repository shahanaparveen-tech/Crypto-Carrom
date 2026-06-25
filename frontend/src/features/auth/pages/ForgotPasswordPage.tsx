import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';

import { Button, TextField, Logo } from '@shared/components';
import { ROUTES } from '@app/config/routes.constants';
import { forgotPasswordSchema, type ForgotPasswordValues } from '../validations/auth.schema';
import { useForgotPassword } from '../hooks';

export const ForgotPasswordPage = (): JSX.Element => {
  const forgot = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = handleSubmit((values) => forgot.mutate(values.email));

  return (
    <div>
      <div className="mb-6 flex justify-center">
        <Logo />
      </div>
      <h1 className="mb-1 text-center font-display text-xl font-bold text-felt">Reset password</h1>
      <p className="mb-6 text-center text-sm text-felt/60">We'll email you a reset token</p>

      {forgot.isSuccess ? (
        <div className="rounded-xl bg-gold/10 p-4 text-center text-sm text-felt/80">
          If that email exists, a reset token is on its way. Then{' '}
          <Link
            to={ROUTES.RESET_PASSWORD}
            className="font-semibold text-gold-light hover:underline"
          >
            reset your password
          </Link>
          .
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Button type="submit" fullWidth size="lg" isLoading={forgot.isPending}>
            Send reset token
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-felt/70">
        <Link to={ROUTES.LOGIN} className="font-semibold text-gold-light hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
};

export default ForgotPasswordPage;
