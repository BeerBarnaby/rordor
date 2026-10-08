import Image from 'next/image';

/** Product symbol, not an official organization seal. */
export function PromMark({ className = 'brand-stamp' }: { className?: string }) {
  return <span className={`${className} prom-mascot-mark`} aria-hidden="true"><Image src="/images/training/prom-logo-rescue-bag-v1.png" alt="" width={1024} height={1024} sizes="(min-width: 640px) 44px, 38px" /></span>;
}
