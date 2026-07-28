"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { href: "/profil", label: "Profil Singkat" },
  { href: "/profil/visi-misi", label: "Visi dan Misi" },
  { href: "/profil/landasan-utama", label: "Landasan Utama" },
  { href: "/profil/fokus-program", label: "Fokus Program" },
  { href: "/profil/struktur-organisasi", label: "Struktur Organisasi Rumah Amal USK" },
];

export default function ProfilLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (href === "/profil") {
      return pathname === "/profil" || pathname === "/profil/";
    }
    return pathname.startsWith(href);
  };

  const activeItem = menuItems.find((item) => isLinkActive(item.href)) || menuItems[0];

  return (
    <main className="min-h-screen bg-white pb-24">
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Dynamic Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm font-semibold mb-8 text-gray-600">
          <Link href="/" className="hover:text-[#0b6330] transition-colors">
            Beranda
          </Link>
          <span className="text-gray-400">/</span>
          <Link href="/profil" className="hover:text-[#0b6330] transition-colors">
            Profil
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-[#0b6330] font-bold">{activeItem.label}</span>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Left Column: Main Content (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* Dynamic Page Content */}
            <div className="text-gray-700 text-sm md:text-[15px] leading-relaxed space-y-4 pt-1">
              {children}
            </div>

          </div>

          {/* Right Column: Sidebar Navigation Card (4 cols) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="bg-[#f4f6f8] rounded-xl overflow-hidden shadow-2xs border border-gray-200/80">
              {menuItems.map((item) => {
                const isActive = isLinkActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block w-full text-left px-5 py-3.5 text-sm transition-all duration-200 border-b border-gray-200/70 last:border-b-0 cursor-pointer ${
                      isActive
                        ? "border-l-[4px] border-[#0b6330] bg-gray-200/80 text-[#0b6330] font-bold"
                        : "text-gray-700 font-medium hover:bg-gray-100/80 hover:text-[#0b6330]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
