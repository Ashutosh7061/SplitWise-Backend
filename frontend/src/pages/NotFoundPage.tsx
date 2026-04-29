import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="panel-card">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p>The route you requested does not exist in this workspace.</p>
      <Link className="button primary" to="/app">Go back to dashboard</Link>
    </section>
  );
}