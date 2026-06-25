import logoUrl from '@shared/assets/image.png';

interface LogoProps {
  size?: number;
  withText?: boolean;
}

/** App brand mark — the carrom-board icon asset. */
export const Logo = ({ size = 56, withText = true }: LogoProps): JSX.Element => (
  <div className="flex flex-col items-center gap-2">
    <img src={logoUrl} width={size} height={size} alt="Crypto Carrom" className="drop-shadow-lg" />
    {withText && (
      <span className="font-display text-2xl font-extrabold tracking-tight text-gold text-shadow-deep">
        Crypto Carrom
      </span>
    )}
  </div>
);

export { logoUrl };
