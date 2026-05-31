import { ButtonLink } from '../ui/Button';
import { Card } from '../ui/Card';

const actions = [
  { to: '/add', label: 'Add Coin Manually' },
  { to: '/scan', label: 'Scan Coin' },
  { to: '/collection', label: 'My Collection' },
  { to: '/value-estimate', label: 'Value Estimate' },
  { to: '/archive', label: 'Archive & Reports' },
];

export function HomePage() {
  return (
    <div className="grid gap-6">
      <section>
        <p className="font-semibold uppercase tracking-[0.08em] text-ledger-oxblood">Collector ledger</p>
        <h1 className="mt-2 font-serif text-4xl font-bold text-ledger-ink">Keep every coin easy to find.</h1>
      </section>
      <div className="grid gap-3 sm:grid-cols-2">
        {actions.map((action) => (
          <ButtonLink key={action.to} to={action.to} className="justify-start">
            {action.label}
          </ButtonLink>
        ))}
      </div>
      <Card>
        <h2 className="font-serif text-2xl font-bold">Collection Summary</h2>
        <p className="mt-2 text-lg">Your local coin ledger is ready.</p>
      </Card>
    </div>
  );
}
