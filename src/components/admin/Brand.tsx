import Link from "next/link";
export default function Brand() {
  return <Link href="/" aria-label="TEMPA — kembali ke website" className="inline-flex items-center gap-3 text-accent">
    <svg viewBox="0 0 64 72" fill="currentColor" aria-hidden="true" className="h-11 w-10 shrink-0">
      <path d="M4 4H37L14 20H4Z" /><path d="M42 4H60V20H40L22 40V24Z" /><path d="M22 47L40 27V56L22 72Z" />
    </svg>
    <span><span className="block text-xl font-semibold tracking-[0.2em]">TEMPA</span>
      <span className="mt-1 block text-[8px] uppercase tracking-[0.25em] text-muted">Barber &amp; Grooming</span>
    </span>
  </Link>;
}
