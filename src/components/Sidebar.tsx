"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: "/zakat", label: "Zakat" },
    { href: "/infaq", label: "Infaq" },
    { href: "/riwayat", label: "Cek Riwayat Zakat" },
    { href: "/kalkulator", label: "Kalkulasi Zakat" },
  ];

  return (
    <div className="lg:col-span-3 space-y-3">
      {menuItems.map((item) => {
        const isActive = pathname === item.href || (item.href === "/zakat" && pathname.startsWith("/zakat"));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`w-full font-bold py-4 px-6 rounded-xl transition-all duration-200 text-left flex justify-between items-center text-sm shadow-xs ${isActive
              ? "bg-[#FFBB0C] text-[#0b6330] shadow-md scale-[1.01]"
              : "bg-gray-100/90 text-gray-700 hover:bg-gray-200 hover:text-[#0b6330]"
              }`}
          >
            <span>{item.label}</span>
            <svg
              className={`w-4 h-4 transition-transform ${isActive ? "text-[#0b6330] translate-x-0.5" : "text-gray-400"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        );
      })}
    </div>
  );
}
