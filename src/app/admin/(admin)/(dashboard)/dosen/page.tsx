import { getDosens } from '@/actions/dosen';
import DosenClient from './DosenClient';

export default async function AdminDosenPage() {
  const dosens = await getDosens();

  return <DosenClient initialData={dosens} />;
}
