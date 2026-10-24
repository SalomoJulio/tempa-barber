const services = [
  {
    number: "01",
    name: "Essential Cut",
    tagline: "Rapi untuk setiap hari.",
    description:
      "Potongan praktis yang disesuaikan dengan karakter rambut dan rutinitasmu.",
    price: "50",
    duration: "± 30 menit",
    includes: [
      "Konsultasi gaya",
      "Haircut",
      "Styling & finishing",
    ],
    featured: false,
  },
  {
    number: "02",
    name: "Signature Cut",
    tagline: "Perhatian lebih. Hasil lebih personal.",
    description:
      "Pengalaman potong rambut lengkap, dari konsultasi hingga sentuhan terakhir.",
    price: "80",
    duration: "± 45 menit",
    includes: [
      "Konsultasi gaya",
      "Haircut & hair wash",
      "Styling & finishing",
    ],
    featured: true,
  },
  {
    number: "03",
    name: "Complete Grooming",
    tagline: "Segarkan seluruh tampilan.",
    description:
      "Perawatan rambut dan perapian janggut untuk tampilan yang selaras.",
    price: "110",
    duration: "± 60 menit",
    includes: [
      "Layanan Signature Cut",
      "Beard trim",
      "Hot towel",
    ],
    featured: false,
  },
];

export default function Services() {
  return (
    <section
      id="layanan"
      aria-labelledby="services-title"
      className="relative isolate overflow-hidden border-t border-foreground/10 bg-background py-16 md:py-24"
    >
      {/* Cahaya lembut di belakang kartu */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_75%,rgba(48,72,88,0.65)_0%,transparent_65%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-20 -z-10 h-64 w-64 rotate-12 rounded-[4rem] border border-accent/10"
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
                Layanan TEMPA
              </p>
            </div>

            <h2
              id="services-title"
              className="mt-7 text-4xl font-normal leading-tight tracking-tight sm:text-5xl lg:text-6xl"
            >
              Pilih perawatannya.
              <span className="mt-1 block font-serif text-5xl italic text-accent sm:text-6xl lg:text-7xl">
                Temukan gayamu.
              </span>
            </h2>
          </div>

          <p className="max-w-sm text-sm leading-7 text-muted md:justify-self-end">
            Dari potongan sehari-hari hingga grooming lengkap.
            Pilih waktu untuk dirimu, kami bantu merapikan
            setiap detailnya.
          </p>
        </div>

        {/* Kartu layanan */}
        <div className="mt-10 grid gap-5 md:mt-14 md:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.number}
              aria-labelledby={`service-${service.number}`}
              className={`relative flex flex-col overflow-hidden rounded-2xl border p-6 lg:p-8 ${
                service.featured
                  ? "border-accent bg-accent text-background"
                  : "border-foreground/15 bg-surface/40 text-foreground"
              }`}
            >
              {/* Nomor dan label */}
              <div className="flex min-h-7 items-center justify-between gap-3">
                <span
                  className={`text-[10px] tracking-[0.2em] ${
                    service.featured
                      ? "text-background/65"
                      : "text-accent"
                  }`}
                >
                  / {service.number}
                </span>

                {service.featured && (
                  <span className="rounded-full border border-background/25 px-3 py-1 text-[9px] uppercase tracking-[0.15em]">
                    Pengalaman khas TEMPA
                  </span>
                )}
              </div>

              <h3
                id={`service-${service.number}`}
                className="mt-7 text-2xl font-medium tracking-tight"
              >
                {service.name}
              </h3>

              <p
                className={`mt-2 font-serif text-xl italic ${
                  service.featured
                    ? "text-background/80"
                    : "text-accent"
                }`}
              >
                {service.tagline}
              </p>

              <p
                className={`mt-4 text-sm leading-7 ${
                  service.featured
                    ? "text-background/75"
                    : "text-muted"
                }`}
              >
                {service.description}
              </p>

              {/* Harga */}
              <div className="mt-8">
                <p
                  className={`text-[9px] uppercase tracking-[0.18em] ${
                    service.featured
                      ? "text-background/65"
                      : "text-muted"
                  }`}
                >
                  Harga layanan
                </p>

                <p className="mt-2 flex items-baseline gap-1">
                  <span className="mr-1 text-sm">Rp</span>
                  <span className="text-5xl tracking-tight">
                    {service.price}
                  </span>
                  <span className="text-lg">.000</span>
                </p>

                <p
                  className={`mt-2 text-xs ${
                    service.featured
                      ? "text-background/70"
                      : "text-muted"
                  }`}
                >
                  {service.duration}
                </p>
              </div>

              {/* Daftar fasilitas */}
              <ul
                className={`mb-8 mt-7 space-y-3 border-t pt-6 ${
                  service.featured
                    ? "border-background/20"
                    : "border-foreground/15"
                }`}
              >
                {service.includes.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm leading-6"
                  >
                    <span
                      aria-hidden="true"
                      className={
                        service.featured
                          ? "text-background/60"
                          : "text-accent"
                      }
                    >
                      ✓
                    </span>

                    {item}
                  </li>
                ))}
              </ul>

              {/* Tombol selalu di bagian bawah */}
              <a
                href="#booking"
                aria-label={`Booking layanan ${service.name}`}
                className={`mt-auto inline-flex min-h-12 items-center justify-between gap-4 rounded-full px-5 py-3 text-sm transition-colors ${
                  service.featured
                    ? "bg-background text-foreground hover:bg-surface"
                    : "border border-accent/50 text-accent hover:bg-accent hover:text-background"
                }`}
              >
                Booking layanan
                <span aria-hidden="true">↗</span>
              </a>
            </article>
          ))}
        </div>

        {/* Catatan */}
        <div className="mt-7 flex flex-col gap-3 border-t border-foreground/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-xs leading-6 text-muted">
            Belum yakin memilih layanan? Mulai dari konsultasi
            untuk menemukan potongan yang sesuai.
          </p>

          <p className="shrink-0 font-serif text-lg italic text-accent">
            Your style. Our attention.
          </p>
        </div>
      </div>
    </section>
  );
}