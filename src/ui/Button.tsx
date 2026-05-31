import { Link, type LinkProps } from 'react-router-dom';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

const variantClasses: Record<Variant, string> = {
  primary: 'bg-ledger-ink text-white border-ledger-ink hover:bg-ledger-oxblood',
  secondary: 'bg-ledger-card text-ledger-ink border-ledger-line hover:border-ledger-brass',
  ghost: 'bg-transparent text-ledger-ink border-transparent hover:bg-ledger-card',
};

const baseClasses =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-md border px-5 py-3 text-base font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-ledger-brass focus:ring-offset-2 focus:ring-offset-ledger-paper disabled:cursor-not-allowed disabled:opacity-60';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export function Button({ className = '', variant = 'primary', ...props }: ButtonProps) {
  return <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props} />;
}

type ButtonLinkProps = LinkProps & {
  children: ReactNode;
  variant?: Variant;
};

export function ButtonLink({ className = '', variant = 'primary', ...props }: ButtonLinkProps) {
  return <Link className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props} />;
}
