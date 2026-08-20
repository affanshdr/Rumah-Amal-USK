import prisma from '@/lib/prisma';
import BeritaEksternalClient from './BeritaEksternalClient';

export const dynamic = 'force-dynamic';

export default async function AdminBeritaEksternalPage() {
  const newsLinks = await prisma.newsLink.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const serialised = newsLinks.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-[#000]">Berita Eksternal</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tambah dan kelola berita dari media eksternal untuk ditampilkan di halaman publik
          </p>
        </div>
        <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100 self-start sm:self-auto">
          {serialised.filter((i) => i.isActive).length} Aktif
        </span>
      </div>

      <BeritaEksternalClient initialData={serialised} />
    </div>
  );
}
