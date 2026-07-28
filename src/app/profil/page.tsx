import Image from "next/image";

export default function ProfilSingkatPage() {
  return (
    <>
      {/* Mosque Header Image (PNG) */}
      <div className="rounded-2xl overflow-hidden shadow-md border border-gray-100 relative w-full h-[300px] sm:h-[360px] md:h-[400px] mb-6">
        <Image
          src="/profil/mesjid-jamik.png"
          alt="Masjid Jamik Universitas Syiah Kuala"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 800px"
          className="object-cover"
        />
      </div>

      <p className="leading-relaxed">
        Kami menyediakan sistem dan layanan yang memudahkan para muzakki atau donatur dalam menunaikan zakat, infaq, shadaqah, maupun wakaf dengan sebaik-baiknya. Menjadikan masjid sebagai pusat pemberdayaan ekonomi umat, Mendayagunakan dana zakat, infaq shadaqah maupun wakaf melalui program-program yang terasa manfaatnya, Mengangkat martabat mustahik, dan membahagiakan muzakki dan donatur.
      </p>
      <p className="leading-relaxed">
        Rumah Amal Masjid Jamik USK berdiri sebagai wujud kepedulian civitas akademika Universitas Syiah Kuala Banda Aceh terhadap pengelolaan zakat yang profesional, transparan, dan akuntabel di lingkungan kampus dan masyarakat sekitar.
      </p>
      <p className="leading-relaxed">
        Melalui berbagai program unggulan di bidang pendidikan, ekonomi, kesehatan, dan dakwah, Rumah Amal senantiasa berkomitmen untuk menjadi penghubung kebaikan antara muzakki dan mustahik secara berkelanjutan.
      </p>
    </>
  );
}
