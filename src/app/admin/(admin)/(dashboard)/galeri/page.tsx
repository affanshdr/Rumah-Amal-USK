import { prisma } from '@/lib/prisma';
import GalleryUploadForm from './GalleryUploadForm';
import GalleryImageCard from './GalleryImageCard';
import Link from 'next/link';

export default async function AdminGaleriPage(
    props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }
) {
    const searchParams = await props.searchParams;
    const page = parseInt(searchParams.page as string || '1', 10);
    const limit = 12; // Menampilkan 12 gambar per halaman
    const skip = (page - 1) * limit;

    const [images, totalCount] = await Promise.all([
        prisma.gallery.findMany({
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.gallery.count()
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return (
        <div>
            <h1 className="text-xl font-bold text-uskGreen mb-6">Galeri</h1>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <GalleryUploadForm />

                <div className="border-t border-gray-100 pt-4">
                    <h3 className="text-sm font-bold text-uskGreen mb-3">
                        Foto Tersimpan ({images.length})
                    </h3>

                    {images.length === 0 ? (
                        <p className="text-xs text-gray-400">Belum ada foto yang diunggah.</p>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                                {images.map((img: any) => (
                                    <GalleryImageCard key={img.id} id={img.id} imageUrl={img.imageUrl} />
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="mt-6 flex justify-center items-center gap-2">
                                    {page > 1 && (
                                        <Link href={`/admin/galeri?page=${page - 1}`} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-bold rounded">
                                            &laquo; Prev
                                        </Link>
                                    )}
                                    <span className="text-xs font-bold text-gray-600">
                                        Halaman {page} dari {totalPages}
                                    </span>
                                    {page < totalPages && (
                                        <Link href={`/admin/galeri?page=${page + 1}`} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-bold rounded">
                                            Next &raquo;
                                        </Link>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}