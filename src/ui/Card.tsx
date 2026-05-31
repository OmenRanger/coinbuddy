import type { HTMLAttributes } from 'react';

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-lg border border-ledger-line bg-ledger-card p-5 shadow-[0_6px_18px_rgba(62,45,26,0.10)] ${className}`}
      {...props}
    />
  );
}
