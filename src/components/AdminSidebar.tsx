"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: "/admin/zakat", label: "Data Zakat" },
    { href: "/admin/infaq", label: "Data Infaq" },
    { href: "/", label: "Kembali ke Website" },
  ];

  return (
    <aside className="w-64 bg-[#0b6330] text-white p-6 min-h-screen flex flex-col justify-between shrink-0 shadow-lg">
      <div>
        <h2 className="text-xl font-black mb-8 text-[#ffc800] tracking-wider uppercase">
          Admin Panel
        </h2>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  isActive
                    ? "bg-[#ffc800] text-[#111111] shadow-md"
                    : "hover:bg-white/10 text-white/90"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-6 border-t border-white/10 text-xs text-white/60">
        Rumah Amal USK &copy; 2025
      </div>
    </aside>
  );
}
