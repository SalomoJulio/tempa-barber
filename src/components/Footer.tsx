const navigation = [
  { label: "Tentang", href: "#tentang" },
  { label: "Layanan", href: "#layanan" },
  { label: "Barber", href: "#barber" },
  { label: "Galeri", href: "#galeri" },
];

export default function Footer() {
  return (
    <footer className="relative isolate overflow-hidden border-t border-foreground/10 bg-background">
      {/* Gradasi latar */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_80%_100%,#304858_0%,transparent_65%)]"
      />

      {/* Lingkaran dekoratif */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-32 -z-10 h-120 w-120 rounded-full border border-accent/10"
      />

      <div className="mx-auto max-w-7xl px-6 pb-7 pt-14 md:pt-20 lg:px-12">
        {/* Ajakan terakhir */}
        <div className="flex flex-col items-start justify-between gap-7 border-b border-foreground/15 pb-10 md:flex-row md:items-center md:gap-12">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-accent">
              Your next fresh start
            </p>

            <h2 className="mt-4 text-3xl font-normal leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Bawa karaktermu.
              <span className="mt-1 block font-serif italic text-accent">
                Kami rapikan detailnya.
              </span>
            </h2>
          </div>

          <a
            href="#booking"
            className="group inline-flex min-h-12 shrink-0 items-center justify-between gap-8 rounded-full bg-accent px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground"
          >
            Rencanakan kunjungan
            <span
              aria-hidden="true"
              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
            >
              ↗
            </span>
          </a>
        </div>

        {/* Informasi dan navigasi */}
        <div className="grid gap-10 py-10 md:grid-cols-2 md:gap-16">
          <div>
            <a
              href="#beranda"
              aria-label="TEMPA — kembali ke beranda"
              className="inline-flex items-center gap-3 text-accent"
            >
              <svg
                viewBox="0 0 64 72"
                fill="currentColor"
                aria-hidden="true"
                className="h-11 w-10 shrink-0"
              >
                <path d="M4 4H37L14 20H4Z" />
                <path d="M42 4H60V20H40L22 40V24Z" />
                <path d="M22 47L40 27V56L22 72Z" />
              </svg>

              <span>
                <span className="block text-xl font-semibold tracking-[0.2em]">
                  TEMPA
                </span>

                <span className="mt-1 block text-[8px] uppercase tracking-[0.25em] text-muted">
                  Barber &amp; Grooming
                </span>
              </span>
            </a>

            <p className="mt-5 max-w-xs text-sm leading-7 text-muted">
              Potongan tepat. Karakter kuat.
              <br />
              Perhatian personal dalam setiap detail.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 md:gap-10">
            <nav aria-label="Navigasi footer">
              <p className="text-[9px] uppercase tracking-[0.2em] text-accent">
                Jelajahi
              </p>

              <ul className="mt-4 space-y-1">
                {navigation.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="inline-flex min-h-11 items-center text-sm text-muted transition-colors hover:text-accent"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-accent">
                Mulai dari sini
              </p>

              <a
                href="#booking"
                className="mt-4 inline-flex min-h-11 items-center gap-3 text-sm text-muted transition-colors hover:text-accent"
              >
                Booking
                <span aria-hidden="true">↗</span>
              </a>

              <p className="mt-4 max-w-48 text-xs leading-6 text-muted">
                Pilih layanan dan waktu melalui form
                pemesanan di website.
              </p>
            </div>
          </div>
        </div>

        {/* Wordmark dekoratif */}
        <div
          aria-hidden="true"
          className="select-none overflow-hidden border-t border-foreground/10 pt-5"
        >
          <p className="text-center text-[clamp(4rem,17vw,13rem)] font-semibold leading-none tracking-[0.08em] text-accent/10">
            TEMPA
          </p>
        </div>

        {/* Catatan portofolio */}
        <div className="mt-6 flex flex-col gap-4 border-t border-foreground/10 pt-6 md:flex-row md:items-start md:justify-between md:gap-10">
          <div className="max-w-lg">
            <p className="text-xs text-foreground/75">
              TEMPA — Konsep website portofolio oleh Salomo Julio.
            </p>

            <p className="mt-2 text-[11px] leading-6 text-muted">
              Brand, profil barber, dan visual merupakan
              ilustrasi konsep. Form booking menyimpan data
              untuk demonstrasi, bukan reservasi barbershop
              sungguhan.
            </p>
          </div>

          <a
            href="#beranda"
            className="inline-flex min-h-11 shrink-0 items-center gap-4 self-start text-xs text-accent transition-colors hover:text-foreground"
          >
            Kembali ke atas
            <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </footer>
  );
}