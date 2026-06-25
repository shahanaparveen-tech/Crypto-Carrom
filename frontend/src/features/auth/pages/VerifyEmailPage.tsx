import { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Button, Logo, Spinner, TextField } from '@shared/components';
import { getApiErrorMessage } from '@shared/services/http';
import { ROUTES } from '@app/config/routes.constants';
import { useForm } from 'react-hook-form';
import { useVerifyEmail } from '../hooks';

export const VerifyEmailPage = (): JSX.Element => {
  const [params] = useSearchParams();
  const verify = useVerifyEmail();
  const autoRan = useRef(false);
  const { register, handleSubmit } = useForm<{ token: string }>({
    defaultValues: { token: params.get('token') ?? '' },
  });

  // Auto-verify if a token is present in the URL.
  useEffect(() => {
    const token = params.get('token');
    if (token && !autoRan.current) {
      autoRan.current = true;
      verify.mutate(token);
    }
  }, [params, verify]);

  const onSubmit = handleSubmit(({ token }) => verify.mutate(token));

  return (
    <div className="text-center">
      <div className="mb-6 flex justify-center">
        <Logo />
      </div>
      <h1 className="mb-4 font-display text-xl font-bold text-felt">Verify your email</h1>

      {verify.isPending && <Spinner className="mx-auto h-8 w-8" />}

      {verify.isSuccess && (
        <p className="rounded-xl bg-gold/10 p-4 text-sm text-felt/80">
          ✅ Email verified! You can now{' '}
          <Link to={ROUTES.LOGIN} className="font-semibold text-gold-light hover:underline">
            sign in
          </Link>
          .
        </p>
      )}

      {!verify.isSuccess && !verify.isPending && (
        <form onSubmit={onSubmit} className="space-y-4 text-left" noValidate>
          <TextField label="Verification token" {...register('token')} />
          {verify.isError && (
            <p className="rounded-lg bg-coin-queen/15 px-3 py-2 text-sm text-coin-queen">
              {getApiErrorMessage(verify.error, 'Verification failed')}
            </p>
          )}
          <Button type="submit" fullWidth size="lg">
            Verify
          </Button>
        </form>
      )}
    </div>
  );
};

export default VerifyEmailPage;
