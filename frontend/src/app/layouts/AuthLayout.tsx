import { Outlet } from 'react-router-dom';

/** Centered layout for unauthenticated pages (login, register, reset). */
export const AuthLayout = (): JSX.Element => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-dark to-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/80 p-8 shadow-xl backdrop-blur">
        <Outlet />
      </div>
    </div>
  );
};
