import { useNavigate } from 'react-router-dom';

import { Button } from '@shared/components';
import { getApiErrorMessage } from '@shared/services/http';
import { ROUTES } from '@app/config/routes.constants';
import { useGuestLogin } from '../hooks';

/** One-tap "Play as Guest" — creates a throwaway account and enters the lobby. */
export const GuestLoginButton = (): JSX.Element => {
  const navigate = useNavigate();
  const guest = useGuestLogin();

  const playAsGuest = async (): Promise<void> => {
    await guest.mutateAsync();
    navigate(ROUTES.LOBBY, { replace: true });
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={guest.isPending}
        onClick={playAsGuest}
      >
        🎮 Play as Guest
      </Button>
      {guest.isError && (
        <p className="text-center text-xs text-coin-queen">
          {getApiErrorMessage(guest.error, 'Could not start a guest session')}
        </p>
      )}
    </div>
  );
};
