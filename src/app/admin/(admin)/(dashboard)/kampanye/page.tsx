import { getKampanye } from "@/actions/kampanye";
import KampanyeClient from "./KampanyeClient";

export const dynamic = 'force-dynamic';

export default async function KampanyePage() {
  const kampanye = await getKampanye();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#000]">Kampanye Donasi</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola daftar kampanye penggalangan dana</p>
        </div>
      </div>

      <KampanyeClient initialData={kampanye} />
    </div>
  );
}
