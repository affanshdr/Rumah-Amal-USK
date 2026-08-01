'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faHandHoldingHeart,
  faGift,
  faImages,
  faNewspaper,
  faBullhorn,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import { logoutAdmin } from '@/actions/admin-auth';
import { useTransition } from 'react';

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const menu = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: faChartLine },
    { href: '/admin/zakat', label: 'Data Zakat', icon: faHandHoldingHeart },
    { href: '/admin/infaq', label: 'Data Infaq', icon: faGift },
    { href: '/admin/donasi', label: 'Data Donasi', icon: faGift },
    { href: '/admin/kampanye', label: 'Kampanye', icon: faNewspaper },
    { href: '/admin/pengumuman', label: 'Pengumuman', icon: faBullhorn },
    { href: '/admin/galeri', label: 'Galeri', icon: faImages },
    { href: '/admin/newsletter', label: 'Newsletter', icon: faNewspaper },
  ];

  function handleLogout() {
    startTransition(() => logoutAdmin());
  }

  return (
    <aside className="w-64 bg-white text-black p-6 flex flex-col justify-between shrink-0 border-r border-gray-100">
      <div>
        <h2 className="text-base font-bold mb-1">Admin Rumah Amal</h2>
        <p className="text-xs text-black/60 mb-6 truncate">{adminName}</p>

        <nav className="space-y-1">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-smooth ${
                pathname.startsWith(item.href)
                  ? 'bg-[#ffc800] text-[#000] font-bold'
                  : 'text-black/90 hover:bg-black/10'
              }`}
            >
              <FontAwesomeIcon icon={item.icon} className="w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <button
        onClick={handleLogout}
        disabled={isPending}
        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-smooth disabled:opacity-50"
      >
        <FontAwesomeIcon icon={faRightFromBracket} className="w-4" />
        {isPending ? 'Keluar...' : 'Logout'}
      </button>
    </aside>
  );
}