'use client';

import { useTransition } from 'react';
import { deleteGalleryImage } from '@/actions/gallery';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

export default function GalleryImageCard({ id, imageUrl }: { id: string; imageUrl: string }) {
    const [isPending, startTransition] = useTransition();

    function handleDelete() {
        if (!confirm('Hapus foto ini dari galeri?')) return;
        startTransition(() => deleteGalleryImage(id, imageUrl));
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <div className="relative rounded-lg overflow-hidden border border-gray-200 group">
            <img src={imageUrl} alt="Galeri" className="w-full h-32 object-cover" />
            <button
                onClick={handleDelete}
                disabled={isPending}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all disabled:opacity-50"
                title="Hapus foto"
            >
                <FontAwesomeIcon icon={faTrash} className="w-[10px] h-[10px]" />
            </button>
        </div>
    );
}