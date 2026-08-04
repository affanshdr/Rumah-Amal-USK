import { getActiveKampanye } from "@/actions/kampanye";
import DonasiClient from "./DonasiClient";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

export default async function DonasiPage() {
  const programs = await getActiveKampanye();

  return (
    <Suspense fallback={<div className="py-20 text-center text-gray-500 font-semibold">Memuat formulir donasi...</div>}>
      <DonasiClient programs={programs} />
    </Suspense>
  );
}
