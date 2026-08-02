import prisma from "@/lib/prisma";
import DonasiTableClient from "./DonasiTableClient";

export const dynamic = 'force-dynamic';

export default async function AdminDonasiPage() {
  const donasi = await prisma.donasi.findMany({
    include: { kampanye: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#000]">Data Donasi</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola data donasi yang masuk dari masyarakat dan dosen</p>
        </div>
      </div>

      <DonasiTableClient initialData={donasi} />
    </div>
  );
}
