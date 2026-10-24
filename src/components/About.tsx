const approach = [
  {
    number: "01",
    title: "Dengarkan.",
    description:
      "Mulai dari kebiasaan, referensi, dan gaya yang ingin kamu tampilkan.",
    shape: "rounded-full",
  },
  {
    number: "02",
    title: "Bentuk.",
    description:
      "Sesuaikan potongan dengan karakter rambut dan tampilan yang kamu inginkan.",
    shape: "rounded-t-full",
  },
  {
    number: "03",
    title: "Sempurnakan.",
    description:
      "Rapikan detail dan temukan cara menata rambut untuk keseharianmu.",
    shape: "rounded-tl-3xl rounded-br-3xl",
  },
];

export default function About() {
  return (
    <section
      id="tentang"
      aria-labelledby="about-title"
      className="relative isolate overflow-hidden border-t border-foreground/10 bg-background py-16 md:py-24"
    >
      {/* Gradasi latar */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_10%_20%,#304858_0%,transparent_55%),linear-gradient(145deg,#1b2c39_0%,#172330_60%,#223343_100%)]"
      />

      {/* Bentuk dekoratif */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 -z-10 h-80 w-80 rounded-full border border-accent/10 md:h-120 md:w-120"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 -z-10 h-48 w-48 rounded-full border border-accent/10 md:h-88 md:w-88"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-32 -z-10 h-96 w-96 rounded-full bg-accent/5 blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="h-px w-8 bg-accent"
          />

          <p className="text-[10px] uppercase tracking-[0.25em] text-accent">
            Tentang TEMPA
          </p>
        </div>

        <div className="mt-9 grid items-center gap-10 md:grid-cols-2 md:gap-12 lg:gap-20">
          {/* Komposisi judul */}
          <div>
            <h2
              id="about-title"
              className="text-4xl font-normal leading-tight tracking-tight sm:text-5xl lg:text-6xl"
            >
              Lebih dari
              <br />
              sekadar
              <span className="mt-2 block font-serif text-5xl italic text-accent sm:text-6xl lg:text-7xl">
                potong rambut.
              </span>
            </h2>

            <div className="mt-9 flex items-center gap-5">
              {/* Simbol abstrak */}
              <div
                aria-hidden="true"
                className="relative flex h-16 w-20 shrink-0 items-center"
              >
                <span className="absolute left-0 h-14 w-14 rounded-full border border-accent/60" />
                <span className="absolute left-6 h-14 w-14 rounded-full border border-accent/60 bg-accent/10" />
              </div>

              <p className="max-w-48 text-xs leading-6 text-muted">
                Karaktermu menjadi awal.
                <br />
                Detail menjadi pembeda.
              </p>
            </div>
          </div>

          {/* Panel cerita */}
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -bottom-3 left-5 right-5 top-5 rounded-bl-3xl rounded-tr-3xl border border-accent/20"
            />

            <div className="relative rounded-bl-3xl rounded-tr-3xl border border-foreground/10 bg-[linear-gradient(135deg,#304858_0%,#223343_55%,#1b2c39_100%)] p-7 sm:p-9 lg:p-10">
              <p className="text-[9px] uppercase tracking-[0.2em] text-accent">
                Dibentuk dengan perhatian
              </p>

              <p className="mt-5 text-lg leading-8 text-foreground lg:text-xl">
                Potongan yang tepat dimulai dari memahami
                orang yang duduk di kursi kami.
              </p>

              <p className="mt-5 text-sm leading-7 text-muted">
                Setiap orang punya karakter, begitu juga rambutnya.
                Kami memulai dengan percakapan: tentang gaya yang
                kamu suka, rutinitasmu, dan bagaimana kamu ingin
                tampil.
              </p>

              <p className="mt-4 text-sm leading-7 text-muted">
                Dari sana, kami membentuk potongan dengan
                perhatian pada detail. Agar hasilnya nyaman
                ditata dan tetap terasa seperti dirimu.
              </p>

              <a
                href="#layanan"
                className="group mt-6 inline-flex min-h-11 items-center gap-5 text-sm text-accent"
              >
                Temukan layanan yang pas
                <span
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1 motion-reduce:transform-none"
                >
                  →
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Tahapan pelayanan */}
        <div className="mt-20 md:mt-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-accent">
                Cara kami bekerja
              </p>

              <h3 className="mt-3 text-2xl font-normal tracking-tight md:text-3xl">
                Gaya yang pas, dimulai dari sini.
              </h3>
            </div>

            <p className="font-serif text-xl italic text-muted">
              Tiga tahap. Satu karakter: kamu.
            </p>
          </div>

          <div className="mt-8 grid items-start gap-4 md:grid-cols-3 md:gap-5">
            {approach.map((item, index) => (
              <div
                key={item.number}
                className={`relative overflow-hidden rounded-2xl border border-foreground/10 bg-[linear-gradient(145deg,rgba(48,72,88,0.75),rgba(23,35,48,0.9))] p-6 lg:p-8 ${
                  index === 1
                    ? "md:mt-6"
                    : index === 2
                      ? "md:mt-12"
                      : ""
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] tracking-[0.2em] text-accent">
                    / {item.number}
                  </span>

                  <div
                    aria-hidden="true"
                    className={`h-10 w-10 border border-accent/50 bg-accent/10 ${item.shape}`}
                  />
                </div>

                <h4 className="mt-8 text-2xl font-normal tracking-tight">
                  {item.title}
                </h4>

                <p className="mt-3 text-sm leading-7 text-muted">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}