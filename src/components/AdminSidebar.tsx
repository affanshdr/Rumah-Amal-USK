'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faImages,
  faNewspaper,
  faBullhorn,
  faRightFromBracket,
  faClipboardList,
  faFile,
  faBuilding,
  faCoins,
  faHandHoldingHeart,
  faReceipt,
} from '@fortawesome/free-solid-svg-icons';
import { logoutAdmin } from '@/actions/admin-auth';
import { useTransition } from 'react';

const menuGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: faChartLine },
    ],
  },
  {
    label: 'Keuangan',
    items: [
      { href: '/admin/zakat', label: 'Zakat', icon: faCoins },
      { href: '/admin/infaq', label: 'Infaq', icon: faHandHoldingHeart },
      { href: '/admin/donasi', label: 'Donasi Kampanye', icon: faReceipt },
    ],
  },
  {
    label: 'Konten',
    items: [
      { href: '/admin/kampanye', label: 'Kampanye', icon: faChartLine },
      { href: '/admin/berita', label: 'Berita', icon: faNewspaper },
      { href: '/admin/program', label: 'Program', icon: faClipboardList },
      { href: '/admin/pengumuman', label: 'Pengumuman', icon: faBullhorn },
    ],
  },
  {
    label: 'Media',
    items: [
      { href: '/admin/galeri', label: 'Galeri', icon: faImages },
      { href: '/admin/dokumen', label: 'Dokumen', icon: faFile },
      { href: '/admin/mitra', label: 'Mitra', icon: faBuilding },
      { href: '/admin/newsletter', label: 'Newsletter', icon: faNewspaper },
    ],
  },
];

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(() => logoutAdmin());
  }

  return (
    <aside
      className="w-64 flex flex-col justify-between shrink-0"
      style={{
        background: '#063A1E',
        minHeight: '100vh',
        borderRight: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Brand */}
      <div>
        <div
          style={{
            padding: '1.5rem 1.25rem 1rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-center gap-2.5 mb-1">
            <div
              style={{
                width: 32,
                height: 32,
                background: '#F5B016',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '1rem' }}>🕌</span>
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: '0.875rem', margin: 0, lineHeight: 1.2 }}>
                Rumah Amal
              </p>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', margin: 0 }}>
                Admin Panel
              </p>
            </div>
          </div>

          <div
            style={{
              marginTop: '0.875rem',
              background: 'rgba(255,255,255,0.07)',
              borderRadius: 8,
              padding: '0.5rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#F5B016',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 800,
                color: '#063A1E',
                flexShrink: 0,
              }}
            >
              {adminName.charAt(0).toUpperCase()}
            </div>
            <p
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.75rem',
                fontWeight: 500,
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {adminName}
            </p>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav style={{ padding: '0.75rem 0.75rem 0' }}>
          {menuGroups.map((group) => (
            <div key={group.label} style={{ marginBottom: '1rem' }}>
              <p
                style={{
                  color: 'rgba(255,255,255,0.3)',
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '0 0.5rem',
                  marginBottom: '0.25rem',
                }}
              >
                {group.label}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {group.items.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.625rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 8,
                        fontSize: '0.8125rem',
                        fontWeight: isActive ? 700 : 500,
                        textDecoration: 'none',
                        transition: 'all 0.15s',
                        background: isActive ? '#F5B016' : 'transparent',
                        color: isActive ? '#063A1E' : 'rgba(255,255,255,0.7)',
                      }}
                    >
                      <FontAwesomeIcon
                        icon={item.icon}
                        style={{ width: 13, flexShrink: 0, opacity: isActive ? 1 : 0.7 }}
                      />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Logout */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={handleLogout}
          disabled={isPending}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            padding: '0.5rem 0.75rem',
            borderRadius: 8,
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: 'rgba(248,113,113,0.85)',
            background: 'transparent',
            border: 'none',
            cursor: isPending ? 'not-allowed' : 'pointer',
            opacity: isPending ? 0.5 : 1,
            transition: 'all 0.15s',
          }}
        >
          <FontAwesomeIcon icon={faRightFromBracket} style={{ width: 13 }} />
          {isPending ? 'Keluar...' : 'Logout'}
        </button>
      </div>
    </aside>
  );
}
