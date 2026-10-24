import Image from "next/image";

const photos = [
  {
    src: "/images/gallery-cut.png",
    alt: "Ilustrasi potongan rambut textured crop dengan taper fade, tampak dari samping belakang.",
    category: "The look",
    title: "Rapi, tanpa kehilangan karakter.",
    layout: "md:row-span-2",
    ratio: "aspect-[4/5] md:aspect-auto",
    position: "object-center",
  },
  {
    src: "/images/gallery-process.png",
    alt: "Ilustrasi barber merapikan rambut pelanggan menggunakan gunting dan sisir.",
    category: "The process",
    title: "Perhatian dalam setiap gerakan.",
    layout: "",
    ratio: "aspect-[3/2] md:aspect-auto",
    position: "object-center",
  },
  {
    src: "/images/gallery-space.png",
    alt: "Ilustrasi interior barbershop dengan kursi kulit, cermin berbingkai kayu, dan cahaya alami.",
    category: "The space",
    title: "Ambil jeda. Nikmati prosesnya.",
    layout: "",
    ratio: "aspect-[3/2] md:aspect-auto",
    position: "object-center",
  },
];

export default function Gallery() {
  return (
    <section
      id="galeri"
      aria-labelledby="gallery-title"
      className="relative isolate overflow-hidden border-t border-foreground/10 bg-background py-16 md:py-24"
    >
      {/* Gradasi latar */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_85%_20%,rgba(48,72,88,0.55)_0%,transparent_60%)]"
      />

      {/* Bentuk dekoratif */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 bottom-12 -z-10 h-80 w-80 rounded-full border border-accent/10"
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Judul */}
        <div className="grid items-end gap-6 md:grid-cols-2 md:gap-12">
          <div>
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-px w-8 bg-accent"
              />

              <p className="text-[10px] uppercase tracking-[0.25em] text-accent">
                Galeri TEMPA
              </p>
            </div>

            <h2
              id="gallery-title"
              className="mt-7 text-4xl font-normal leading-tight tracking-tight sm:text-5xl lg:text-6xl"
            >
              Lihat detailnya.
              <span className="mt-1 block font-serif text-5xl italic text-accent sm:text-6xl lg:text-7xl">
                Rasakan karakternya.
              </span>
            </h2>
          </div>

          <p className="max-w-sm text-sm leading-7 text-muted md:justify-self-end">
            Potongan, proses, dan ruang yang membentuk
            pengalaman TEMPA. Setiap bagian punya ceritanya.
          </p>
        </div>

        {/* Grid foto */}
        <div className="mt-10 grid gap-4 md:mt-14 md:h-160 md:grid-cols-2 md:grid-rows-2 lg:h-180">
          {photos.map((photo, index) => (
            <figure
              key={photo.src}
              className={`group relative isolate overflow-hidden rounded-2xl border border-foreground/10 bg-surface ${photo.layout} ${photo.ratio}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 1280px) 584px, (min-width: 768px) 50vw, 100vw"
                className={`object-cover transition-transform duration-700 motion-safe:group-hover:scale-105 ${photo.position}`}
              />

              {/* Bayangan di belakang caption */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(12,21,29,0.9)_0%,rgba(12,21,29,0.3)_30%,transparent_65%)]"
              />

              {/* Nomor foto */}
              <span
                aria-hidden="true"
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-background/30 text-[10px] tracking-widest text-white backdrop-blur-sm md:right-5 md:top-5"
              >
                0{index + 1}
              </span>

              <figcaption className="absolute inset-x-0 bottom-0 p-6 lg:p-8">
                <p className="text-[9px] uppercase tracking-[0.25em] text-accent">
                  {photo.category}
                </p>

                <h3
                  className={`mt-2 max-w-sm font-normal leading-snug tracking-tight text-white ${
                    index === 0
                      ? "text-2xl lg:text-3xl"
                      : "text-xl lg:text-2xl"
                  }`}
                >
                  {photo.title}
                </h3>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Penutup galeri */}
        <div className="mt-6 flex flex-col gap-4 border-t border-foreground/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-xs leading-6 text-muted">
            Visual dibuat dengan AI untuk menggambarkan
            konsep dan suasana TEMPA.
          </p>

          <a
            href="#booking"
            className="group inline-flex min-h-11 items-center gap-5 self-start text-sm text-accent"
          >
            Giliran kamu menemukan gaya
            <span
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-1 motion-reduce:transform-none"
            >
              ↗
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}