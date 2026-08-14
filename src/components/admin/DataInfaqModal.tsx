'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHandHoldingHeart,
  faXmark,
  faUser,
  faBuilding,
  faPhone,
  faCalendar,
  faIdCard,
  faLink,
  faUnlink,
} from '@fortawesome/free-solid-svg-icons';

type DosenInfo = {
  nip: string;
  nama: string;
  npwp: string | null;
  alamat: string | null;
  unitKerja: string | null;
  noHp: string | null;
};

type DataInfaqModalProps = {
  isOpen: boolean;
  onClose: () => void;
  item: {
    nama: string;
    nip: string | null;
    noHp: string | null;
    dosen: DosenInfo | null;
    tipePembayar: string;
    jenisInfaq: string;
    kampanyeId: string | null;
    kampanyeJudul: string | null;
    jumlahInfaq: number;
    tanggal: string;
  } | null;
};

function formatRupiah(angka: number) {
  return 'Rp ' + angka.toLocaleString('id-ID');
}

type RowProps = { icon: React.ReactNode; label: string; value: React.ReactNode };
function DetailRow({ icon, label, value }: RowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-[#063A1E]/8 text-[#063A1E] flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <div className="text-xs font-medium text-gray-900 mt-0.5 break-words">{value}</div>
      </div>
    </div>
  );
}

export default function DataInfaqModal({ isOpen, onClose, item }: DataInfaqModalProps) {
  if (!isOpen || !item) return null;

  const noHp = item.dosen?.noHp || item.noHp;
  const unitKerja = item.dosen?.unitKerja;
  const isTerikat = !!item.kampanyeJudul;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#063A1E]/10 text-[#063A1E] flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faHandHoldingHeart} className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 leading-tight">Detail Data Infaq</h3>
              <p className="text-[11px] text-gray-500">Informasi lengkap pembayaran infaq</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 flex items-center justify-center transition-colors cursor-pointer"
            title="Tutup"
          >
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Highlight: Jenis Infaq + Jumlah */}
          <div className="bg-[#063A1E] text-white rounded-xl p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold text-emerald-200 uppercase tracking-wider mb-0.5">Jenis Infaq</p>
              <p className="font-bold text-sm capitalize">{item.jenisInfaq}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold text-emerald-200 uppercase tracking-wider mb-0.5">Jumlah</p>
              <p className="font-black text-lg text-emerald-300">{formatRupiah(item.jumlahInfaq)}</p>
            </div>
          </div>

          {/* Kampanye badge */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold ${
            isTerikat
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-gray-50 border-gray-200 text-gray-500'
          }`}>
            <FontAwesomeIcon
              icon={isTerikat ? faLink : faUnlink}
              className={`w-3 h-3 ${isTerikat ? 'text-emerald-600' : 'text-gray-400'}`}
            />
            {isTerikat ? (
              <span>Kampanye: <span className="font-bold">{item.kampanyeJudul}</span></span>
            ) : (
              <span>Infaq Bebas — tidak terikat kampanye</span>
            )}
          </div>

          {/* Detail Rows */}
          <div className="space-y-3.5">
            <DetailRow
              icon={<FontAwesomeIcon icon={faUser} className="w-3.5 h-3.5" />}
              label="Nama Pembayar"
              value={item.nama}
            />

            <DetailRow
              icon={<FontAwesomeIcon icon={faIdCard} className="w-3.5 h-3.5" />}
              label="Tipe Pembayar"
              value={
                <span className="capitalize bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                  {item.tipePembayar}
                </span>
              }
            />

            {item.nip && (
              <DetailRow
                icon={<FontAwesomeIcon icon={faIdCard} className="w-3.5 h-3.5" />}
                label="NIP"
                value={<span className="font-mono">{item.nip}</span>}
              />
            )}

            {unitKerja && (
              <DetailRow
                icon={<FontAwesomeIcon icon={faBuilding} className="w-3.5 h-3.5" />}
                label="Unit Kerja"
                value={unitKerja}
              />
            )}

            {noHp && (
              <DetailRow
                icon={<FontAwesomeIcon icon={faPhone} className="w-3.5 h-3.5" />}
                label="No. HP"
                value={noHp}
              />
            )}

            <DetailRow
              icon={<FontAwesomeIcon icon={faCalendar} className="w-3.5 h-3.5" />}
              label="Tanggal"
              value={<span className="font-mono">{item.tanggal}</span>}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#063A1E] hover:bg-[#042814] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
