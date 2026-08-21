"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { hitungZakat, formatRupiah } from "@/lib/kalkulator";
import { formatThousand, parseRawNumber } from "@/lib/formatNumber";
import { JenisZakat, JenisPerusahaan, KalkulatorResult } from "@/types";
import { kalkulatorDictionary, KalkulatorLanguage } from "@/lib/i18n/kalkulator";

interface FieldItem {
  name: string;
  label: string;
}

export interface NisabConfigType {
  hargaEmasPerGram: number;
  nisabEmasGram: number;
  nisabProfesiBulan: number;
  aturanQanun: string | null;
  skNisabProfesi: string | null;
}

const fieldConfig: Record<string, FieldItem[]> = {
  maal: [
    { name: "total_harta", label: "Total Harta Tabungan / Piutang (Rp)" },
    { name: "total_hutang", label: "Total Hutang Jatuh Tempo (Rp)" },
    { name: "total_kebutuhan", label: "Total Kebutuhan Pokok/Pengeluaran Primer (Rp)" },
  ],
  emas: [
    { name: "berat_emas_gram", label: "Berat Emas yang Dimiliki (gram)" },
  ],
  profesi: [
    { name: "penghasilan_bulan", label: "Penghasilan Rutin per Bulan (Rp)" },
    { name: "bonus_tunjangan", label: "Bonus / Tunjangan Lainnya (Rp)" },
    { name: "total_hutang", label: "Total Hutang dalam waktu dekat (Rp)" },
    { name: "total_kebutuhan", label: "Total Kebutuhan Pokok/Pengeluaran Primer (Rp)" },
  ],
  perniagaan: [
    { name: "modal_usaha", label: "Modal Usaha Putar (Rp)" },
    { name: "keuntungan", label: "Keuntungan Bersih (Rp)" },
    { name: "hutang_jangka_pendek", label: "Hutang Usaha Jangka Pendek (Rp)" },
    { name: "total_kebutuhan", label: "Total Kebutuhan Pokok/Pengeluaran Primer (Rp)" },
  ],
};

const fieldConfigPerusahaan: Record<string, FieldItem[]> = {
  dagang_industri: [
    { name: "aset_lancar", label: "Aset Lancar Perusahaan (Rp)" },
    { name: "hutang_lancar", label: "Hutang Lancar Perusahaan (Rp)" },
  ],
  jasa: [
    { name: "laba_sebelum_pajak", label: "Laba Sebelum Pajak (Rp)" },
  ],
};

export default function KalkulatorClient({ nisabConfig }: { nisabConfig: NisabConfigType }) {
  const [lang, setLang] = useState<KalkulatorLanguage>("id");
  const [jenisZakat, setJenisZakat] = useState<string>("");
  const [jenisPerusahaan, setJenisPerusahaan] = useState<string>("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [modalResult, setModalResult] = useState<KalkulatorResult | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    const readLang = () => {
      const saved = (localStorage.getItem("language") ||
        localStorage.getItem("app_lang") ||
        "id") as KalkulatorLanguage;
      if (["id", "en", "ar"].includes(saved)) {
        setLang(saved);
      }
    };
    readLang();
    window.addEventListener("languageChange", readLang);
    return () => window.removeEventListener("languageChange", readLang);
  }, []);

  const t = kalkulatorDictionary[lang] || kalkulatorDictionary.id;
  const isAr = lang === "ar";

  const handleInputChange = (fieldName: string, value: string) => {
    if (fieldName.includes("gram")) {
      setFieldValues((prev) => ({ ...prev, [fieldName]: value }));
    } else {
      const formatted = formatThousand(value);
      setFieldValues((prev) => ({ ...prev, [fieldName]: formatted }));
    }
  };

  const handleHitung = () => {
    if (!jenisZakat) {
      alert(t.alertSelectZakat);
      return;
    }

    if (jenisZakat === "perusahaan" && !jenisPerusahaan) {
      alert(t.alertSelectCompany);
      return;
    }

    const cleanedValues: Record<string, any> = {};
    Object.keys(fieldValues).forEach((key) => {
      cleanedValues[key] = key.includes("gram")
        ? fieldValues[key]
        : parseRawNumber(fieldValues[key]);
    });

    const payload: Record<string, any> = {
      jenis_zakat: jenisZakat as JenisZakat,
      jenis_perusahaan: jenisPerusahaan as JenisPerusahaan,
      ...cleanedValues,
    };

    const res = hitungZakat(payload as any, nisabConfig);
    setModalResult(res);
    setShowModal(true);
  };

  const activeFields: FieldItem[] =
    jenisZakat === "perusahaan"
      ? fieldConfigPerusahaan[jenisPerusahaan] || []
      : fieldConfig[jenisZakat] || [];

  return (
    <main
      className={`flex-grow py-10 px-4 sm:px-6 lg:px-8 max-w-[1340px] mx-auto w-full ${isAr ? "text-right" : ""
        }`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Navigasi */}
        <Sidebar />

        {/* Konten Kalkulator */}
        <div className="lg:col-span-9 bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-gray-100 space-y-6">
          <h3 className="text-xl font-black text-[#000] border-b border-gray-100 pb-3">
            {t.pageTitle}
          </h3>

          {/* Informasi Acuan Nisab */}
          <div
            className={`bg-amber-50/70 border-l-4 border-[#FFBB0C] p-4 rounded-r-xl text-xs sm:text-sm text-gray-800 space-y-1.5 ${isAr ? "border-l-0 border-r-4 rounded-r-none rounded-l-xl" : ""
              }`}
          >
            <p className="font-extrabold text-[#000]">{t.nisabTitle}</p>
            <ul className="list-disc list-inside space-y-1.5 text-gray-700 font-medium leading-relaxed">
              <li>
                {(() => {
                  const text = nisabConfig.aturanQanun || 'Qanun Aceh No. 10/2018 tentang Baitul Mal';
                  if (lang === 'en') return text.replace('tentang', 'regarding');
                  if (lang === 'ar') return text.replace('Qanun Aceh No. 10/2018 tentang Baitul Mal', 'قانون أتشيه رقم ١٠/٢٠١٨ بشأن بيت المال').replace('tentang', 'بشأن');
                  return text;
                })()}
              </li>
              <li>
                {nisabConfig.skNisabProfesi || 'SK DPS BMA No. 04/KPTS/2025'}: {t.nisabProfesi}{" "}
                <span className="font-bold text-gray-900">
                  {formatRupiah(nisabConfig.nisabProfesiBulan)} {t.perBulan}
                </span>
              </li>
              <li>
                {t.nisabEmasSetara}{" "}
                <span className="font-bold text-gray-900">{nisabConfig.nisabEmasGram}</span>{" "}
                {t.gramEmasMurni} (
                <span className="font-bold text-gray-900">
                  {formatRupiah(nisabConfig.nisabEmasGram * nisabConfig.hargaEmasPerGram)}
                </span>
                )
              </li>
              <li>
                {t.hargaEmasAcuan}{" "}
                <span className="font-bold text-gray-900">
                  {formatRupiah(nisabConfig.hargaEmasPerGram)} {t.perGram}
                </span>
              </li>
            </ul>
          </div>

          {/* Pilih Jenis Zakat */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              {t.selectJenisZakatLabel}
            </label>
            <select
              value={jenisZakat}
              onChange={(e) => {
                setJenisZakat(e.target.value);
                setJenisPerusahaan("");
                setFieldValues({});
              }}
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0b6330] bg-white"
            >
              <option value="">{t.selectJenisZakatDefault}</option>
              <option value="maal">{t.optMaal}</option>
              <option value="emas">{t.optEmas}</option>
              <option value="profesi">{t.optProfesi}</option>
              <option value="perniagaan">{t.optPerniagaan}</option>
              <option value="perusahaan">{t.optPerusahaan}</option>
            </select>
          </div>

          {/* Pilih Jenis Perusahaan */}
          {jenisZakat === "perusahaan" && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {t.jenisPerusahaanLabel}
              </label>
              <select
                value={jenisPerusahaan}
                onChange={(e) => {
                  setJenisPerusahaan(e.target.value);
                  setFieldValues({});
                }}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0b6330] bg-white"
              >
                <option value="">{t.selectJenisPerusahaanDefault}</option>
                <option value="dagang_industri">{t.optDagangIndustri}</option>
                <option value="jasa">{t.optJasa}</option>
              </select>
            </div>
          )}

          {/* Field Input Dinamis */}
          {activeFields.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-gray-100">
              {activeFields.map((field) => (
                <div key={field.name}>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    {t[`field_${field.name}`] || field.label}
                  </label>
                  <input
                    type={field.name.includes("gram") ? "number" : "text"}
                    value={fieldValues[field.name] || ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    placeholder={t.inputPlaceholder}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0b6330] bg-white font-medium"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Tombol Hitung */}
          <button
            type="button"
            onClick={handleHitung}
            className="w-full sm:w-auto bg-[#FFBB0C] hover:bg-[#e8b500] text-[#000] font-black py-3 px-8 rounded-xl text-sm shadow-md transition-all cursor-pointer"
          >
            {t.calculateBtn}
          </button>
        </div>
      </div>

      {/* Modal Hasil Perhitungan */}
      {showModal && modalResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-7 text-center space-y-4 border border-gray-100">
            {modalResult.mencapai_nisab ? (
              <>
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto text-[#000]">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-xl font-extrabold text-[#000]">{t.wajibTitle}</h4>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  {t.wajibDesc}
                </p>
                <div className="text-2xl font-black text-[#000] bg-green-50 py-3 rounded-xl border border-green-200">
                  {formatRupiah(modalResult.jumlah_zakat)}
                </div>
                <div className="pt-3 flex gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    {t.closeModalBtn}
                  </button>
                  <Link
                    href={`/zakat?jenis_zakat=${modalResult.jenis_zakat}&jumlah_zakat=${modalResult.jumlah_zakat}`}
                    className="bg-[#FFBB0C] hover:bg-[#e8b500] text-[#000] font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-sm transition-all"
                  >
                    {t.bayarZakatBtn}
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-xl font-extrabold text-gray-800">{t.belumTitle}</h4>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {t.belumDesc}
                </p>
                <div className="pt-3 flex gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    {t.closeModalBtn}
                  </button>
                  <Link
                    href="/infaq"
                    className="bg-[#FFBB0C] hover:bg-[#e8b500] text-[#000] font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-sm transition-all"
                  >
                    {t.bayarInfaqBtn}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
