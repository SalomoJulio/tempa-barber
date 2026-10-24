import Image from "next/image";

const specialties = [
  "Classic cut",
  "Textured crop",
  "Clean fade",
];

export default function Barbers() {
  return (
    <section
      id="barber"
      aria-labelledby="barber-title"
      className="relative isolate overflow-hidden border-t border-foreground/10 bg-background py-16 md:py-24"
    >
      {/* Gradasi latar */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_15%_50%,rgba(48,72,88,0.65)_0%,transparent_60%)]"
      />

      {/* Lingkaran dekoratif */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-16 -z-10 h-80 w-80 rounded-full border border-accent/10 md:h-120 md:w-120"
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Judul section */}
        <div className="grid items-end gap-6 md:grid-cols-2 md:gap-12">
          <div>
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-px w-8 bg-accent"
              />

              <p className="text-[10px] uppercase tracking-[0.25em] text-accent">
                Di balik setiap potongan
              </p>
            </div>

            <h2
              id="barber-title"
              className="mt-7 text-4xl font-normal leading-tight tracking-tight sm:text-5xl lg:text-6xl"
            >
              Kenali tangan
              <span className="mt-1 block font-serif text-5xl italic text-accent sm:text-6xl lg:text-7xl">
                di balik gayamu.
              </span>
            </h2>
          </div>

          <p className="max-w-sm text-sm leading-7 text-muted md:justify-self-end">
            Teknik yang teliti, percakapan yang santai.
            Kenali barber yang akan membantu menemukan
            potongan sesuai karaktermu.
          </p>
        </div>

        {/* Profil barber */}
        <div className="mt-10 grid overflow-hidden rounded-3xl border border-foreground/15 md:mt-14 md:grid-cols-2">
          {/* Foto */}
          <div className="relative isolate min-h-100 overflow-hidden bg-surface md:min-h-140">
            <Image
              src="/images/arga-barber.png"
              alt="Arga, karakter barber untuk konsep website TEMPA, mengenakan apron di barbershop."
              fill
              sizes="(min-width: 1280px) 592px, (min-width: 768px) 50vw, 100vw"
              className="object-cover object-[center_25%]"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(23,35,48,0.95)_0%,rgba(23,35,48,0.2)_25%,transparent_50%)]"
            />

            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 px-6 py-5 lg:px-8">
              <span className="text-[9px] uppercase tracking-[0.2em] text-foreground/85">
                The people behind TEMPA
              </span>

              <span
                aria-hidden="true"
                className="text-xl text-accent"
              >
                ✳
              </span>
            </div>
          </div>

          {/* Informasi profil */}
          <div className="flex flex-col justify-center bg-[linear-gradient(145deg,#2b4050_0%,#223343_50%,#1b2c39_100%)] p-7 sm:p-9 lg:p-12">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-accent"
              />

              <p className="text-[9px] uppercase tracking-[0.2em] text-accent">
                Meet your barber
              </p>
            </div>

            <h3 className="mt-5 text-4xl font-normal tracking-tight lg:text-5xl">
              Arga.
            </h3>

            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">
              Barber / TEMPA
            </p>

            <blockquote className="mt-7 border-l border-accent/50 pl-5 font-serif text-2xl italic leading-snug text-foreground lg:text-3xl">
              “Potongan yang bagus harus tetap terasa pas,
              bahkan setelah kamu pulang.”
            </blockquote>

            <p className="mt-6 text-sm leading-7 text-muted">
              Berangkat dari bentuk rambut dan kebiasaan
              sehari-hari, Arga membantu menerjemahkan
              referensimu menjadi potongan yang nyaman
              dipakai dan mudah ditata.
            </p>

            {/* Fokus gaya */}
            <div className="mt-7">
              <p className="text-[9px] uppercase tracking-[0.2em] text-accent">
                Fokus gaya
              </p>

              <ul className="mt-3 flex flex-wrap gap-2">
                {specialties.map((specialty) => (
                  <li
                    key={specialty}
                    className="rounded-full border border-foreground/15 bg-background/20 px-3 py-2 text-xs text-foreground/80"
                  >
                    {specialty}
                  </li>
                ))}
              </ul>
            </div>

            <a
              href="#booking"
              className="group mt-8 inline-flex min-h-12 items-center justify-between gap-6 self-start rounded-full bg-accent px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground"
            >
              Jadwalkan kunjungan

              <span
                aria-hidden="true"
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
              >
                ↗
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}