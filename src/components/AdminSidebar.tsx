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
  faRightFromBracket 
} from '@fortawesome/free-solid-svg-icons';

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();

  const menu = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: faChartLine },
    { href: '/admin/zakat', label: 'Data Zakat', icon: faHandHoldingHeart },
    { href: '/admin/infaq', label: 'Data Infaq', icon: faGift },
    { href: '/admin/galeri', label: 'Galeri', icon: faImages },
    { href: '/admin/newsletter', label: 'Newsletter', icon: faNewspaper },
  ];

  return (
    <aside className="w-64 bg-[#fff] text-black p-6 flex flex-col justify-between shrink-0">
      <div>
        <h2 className="text-base font-bold mb-1">Admin Rumah Amal</h2>
        <p className="text-xs text-black/60 mb-6 truncate">{adminName}</p>

        <nav className="space-y-1">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-smooth ${pathname.startsWith(item.href)
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
        disabled
        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-700 cursor-not-allowed"
        title="Logout dinonaktifkan sementara (mode preview)"
      >
        <FontAwesomeIcon icon={faRightFromBracket} className="w-4" />
        Logout
      </button>
    </aside>
  );
}