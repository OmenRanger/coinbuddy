import { Archive, BookOpen, Camera, Home, Landmark, Settings } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/scan', label: 'Scan', icon: Camera },
  { to: '/collection', label: 'Collection', icon: Landmark },
  { to: '/archive', label: 'Archive', icon: Archive },
  { to: '/learn', label: 'Learn', icon: BookOpen },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function AppLayout() {
  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <header className="border-b border-ledger-line bg-ledger-card/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <NavLink to="/" className="font-serif text-3xl font-bold text-ledger-ink">
            CoinBuddy
          </NavLink>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-semibold ${isActive ? 'bg-ledger-ink text-white' : 'hover:bg-ledger-paper'}`
                }
                end={to === '/'}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
      <nav
        className="fixed inset-x-0 bottom-0 grid grid-cols-6 border-t border-ledger-line bg-ledger-card md:hidden"
        aria-label="Primary"
      >
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-semibold ${isActive ? 'text-ledger-oxblood' : 'text-ledger-ink'}`
            }
            end={to === '/'}
          >
            <Icon aria-hidden="true" size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
