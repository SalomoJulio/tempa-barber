export default function Hero() {
  return (
    <section
      id="beranda"
      aria-labelledby="hero-title"
      className="overflow-hidden bg-background"
    >
      {/* Area utama Hero */}
      <div className="relative isolate">
        {/* Foto latar */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div
            className="absolute inset-0 bg-cover bg-position-[70%_center] md:bg-center"
            style={{
              backgroundImage: "url('/images/hero.png')",
            }}
          />

          {/* Gelap di sisi teks */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,21,29,0.78)_0%,rgba(12,21,29,0.4)_55%,rgba(12,21,29,0.15)_100%)] md:bg-[linear-gradient(90deg,rgba(12,21,29,0.9)_0%,rgba(12,21,29,0.55)_45%,rgba(12,21,29,0.08)_100%)]" />

          {/* Transisi ke panel bawah */}
          <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--background)_0%,rgba(23,35,48,0.55)_18%,transparent_55%)]" />
        </div>

        <div className="mx-auto flex min-h-140 max-w-7xl flex-col justify-between gap-10 px-6 pb-8 pt-12 md:min-h-160 md:pb-10 md:pt-20 lg:min-h-180 lg:px-12 lg:pt-24">
          <div className="max-w-xl">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-px w-7 shrink-0 bg-accent"
              />

              <p className="text-[9px] uppercase tracking-[0.2em] text-accent sm:text-[10px]">
                A cut that feels like you
              </p>
            </div>

            <h1
              id="hero-title"
              className="mt-7 text-5xl font-normal leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
            >
              <span className="block">
                Potongan
                <br />
                tepat.
              </span>

              <span className="mt-3 block font-serif text-5xl font-normal italic leading-tight text-accent sm:text-7xl lg:text-8xl">
                Karakter kuat.
              </span>
            </h1>

            <p className="mt-6 max-w-64 text-sm leading-7 text-foreground/85 md:max-w-sm md:text-base">
              Gaya yang mencerminkan dirimu.
              <br />
              Ditempa lewat detail, bukan sekadar potongan.
            </p>

            <a
              href="#booking"
              className="group mt-7 inline-flex min-h-12 items-center justify-center gap-7 rounded-full bg-accent px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground"
            >
              Temukan gaya kamu

              <span
                aria-hidden="true"
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
              >
                ↗
              </span>
            </a>
          </div>

          <div className="flex items-end justify-between gap-6">
            <p className="text-[9px] uppercase leading-5 tracking-[0.18em] text-foreground/65 md:text-[10px]">
              Personal approach.
              <br />
              Precision in every cut.
            </p>

            <a
              href="#tentang"
              aria-label="Kenali TEMPA"
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-foreground/30 text-lg text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </div>

      {/* Panel informasi terpisah dari foto */}
      <div className="relative mx-auto max-w-7xl px-6 pb-8 lg:px-12">
        <div className="grid overflow-hidden border border-foreground/15 md:grid-cols-3">
          {/* Filosofi */}
          <div className="bg-background p-6 md:p-7">
            <p className="text-[9px] uppercase tracking-[0.2em] text-accent">
              Filosofi TEMPA
            </p>

            <p className="mt-4 font-serif text-2xl leading-snug">
              “Gaya terbaik adalah yang terasa seperti dirimu.”
            </p>

            <a
              href="#tentang"
              className="mt-5 inline-flex min-h-11 items-center gap-4 text-xs text-muted transition-colors hover:text-accent"
            >
              Cerita di balik TEMPA
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          {/* Layanan */}
          <div className="border-t border-foreground/15 bg-surface p-6 md:border-l md:border-t-0 md:p-7">
            <p className="text-[9px] uppercase leading-5 tracking-[0.2em] text-accent">
              Dari konsultasi hingga finishing
            </p>

            <h2 className="mt-4 text-xl font-medium">
              Detail yang membuat beda.
            </h2>

            <p className="mt-3 text-sm leading-6 text-muted">
              Kenali gayamu, tentukan potongannya, lalu sempurnakan
              setiap detailnya.
            </p>

            <a
              href="#layanan"
              className="mt-4 inline-flex min-h-11 items-center gap-4 text-xs text-foreground transition-colors hover:text-accent"
            >
              Jelajahi layanan
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          {/* Booking */}
          <a
            href="#booking"
            className="group flex flex-col justify-between gap-8 bg-accent p-6 text-background transition-colors hover:bg-foreground md:p-7"
          >
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em]">
                Your next fresh start
              </p>

              <h2 className="mt-4 text-3xl font-normal leading-tight tracking-tight">
                Saatnya tampil
                <br />
                lebih percaya diri.
              </h2>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-xs underline underline-offset-4">
                Booking sekarang
              </span>

              <span
                aria-hidden="true"
                className="text-3xl transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 motion-reduce:transform-none"
              >
                ↗
              </span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}