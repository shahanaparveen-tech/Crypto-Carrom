interface PlaceholderPageProps {
  title: string;
  description?: string;
}

/**
 * Temporary page used by the route table during the foundation phase. Each
 * route is replaced by its real feature page as features are implemented.
 */
export const PlaceholderPage = ({ title, description }: PlaceholderPageProps): JSX.Element => {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="mb-3 rounded-full bg-brand/20 px-3 py-1 text-xs font-medium uppercase tracking-wide text-brand-light">
        Foundation
      </span>
      <h1 className="font-display text-3xl font-semibold">{title}</h1>
      <p className="mt-2 max-w-md text-slate-400">
        {description ?? 'This feature is scaffolded and will be implemented in a later phase.'}
      </p>
    </section>
  );
};
