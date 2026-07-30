import { getActiveKampanye } from "@/actions/kampanye";
import DonasiClient from "./DonasiClient";

export const dynamic = 'force-dynamic';

export default async function DonasiPage() {
  const programs = await getActiveKampanye();

  return (
    <DonasiClient programs={programs} />
  );
}
