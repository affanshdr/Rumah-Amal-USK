import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import NewsletterModal from './NewsletterModal';
import NewsletterCard from './NewsletterCard';

export default async function AdminNewsletterPage(
    props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }
) {
    const searchParams = await props.searchParams;
    const page = parseInt((searchParams.page as string) || '1', 10);
    const limit = 9; // Menampilkan 9 newsletter per halaman
    const skip = (page - 1) * limit;

    const [newsletters, totalCount] = await Promise.all([
        prisma.newsletter.findMany({
            orderBy: { tanggal: 'desc' },
            skip,
            take: limit,
        }),
        prisma.newsletter.count(),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-uskGreen">Newsletter</h1>
                <NewsletterModal />
            </div>

            {/* Card container */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">

                {/* Info jumlah */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-uskGreen">
                        Newsletter Tersimpan ({totalCount})
                    </h3>
                    {totalPages > 1 && (
                        <span className="text-xs text-gray-400">
                            Halaman {page} dari {totalPages}
                        </span>
                    )}
                </div>

                {/* Daftar newsletter */}
                {newsletters.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <i className="fa-regular fa-newspaper text-4xl text-gray-300 mb-3"></i>
                        <p className="text-sm font-semibold text-gray-400">Belum ada newsletter.</p>
                        <p className="text-xs text-gray-300 mt-1">Klik &quot;Tambah Newsletter&quot; untuk menambahkan.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {newsletters.map((item: any) => (
                                <NewsletterCard
                                    key={item.id}
                                    id={item.id}
                                    judul={item.judul}
                                    tanggal={item.tanggal}
                                    imageUrl={item.imageUrl}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center items-center gap-2">
                                {/* Tombol Prev */}
                                {page > 1 ? (
                                    <Link
                                        href={`/admin/newsletter?page=${page - 1}`}
                                        className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-xs font-bold rounded-lg transition-smooth"
                                    >
                                        « Prev
                                    </Link>
                                ) : (
                                    <span className="px-4 py-1.5 bg-gray-50 text-gray-300 text-xs font-bold rounded-lg cursor-not-allowed">
                                        « Prev
                                    </span>
                                )}

                                {/* Nomor halaman */}
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                                        const isActive = p === page;
                                        const showPage =
                                            p === 1 ||
                                            p === totalPages ||
                                            Math.abs(p - page) <= 1;

                                        if (!showPage) {
                                            // Ellipsis
                                            if (p === 2 && page > 3) {
                                                return <span key={`ellipsis-start`} className="text-xs text-gray-400 px-1">...</span>;
                                            }
                                            if (p === totalPages - 1 && page < totalPages - 2) {
                                                return <span key={`ellipsis-end`} className="text-xs text-gray-400 px-1">...</span>;
                                            }
                                            return null;
                                        }

                                        return (
                                            <Link
                                                key={p}
                                                href={`/admin/newsletter?page=${p}`}
                                                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-smooth ${isActive
                                                    ? 'bg-uskGreen text-white shadow-sm'
                                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                                    }`}
                                            >
                                                {p}
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Tombol Next */}
                                {page < totalPages ? (
                                    <Link
                                        href={`/admin/newsletter?page=${page + 1}`}
                                        className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-xs font-bold rounded-lg transition-smooth"
                                    >
                                        Next »
                                    </Link>
                                ) : (
                                    <span className="px-4 py-1.5 bg-gray-50 text-gray-300 text-xs font-bold rounded-lg cursor-not-allowed">
                                        Next »
                                    </span>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
