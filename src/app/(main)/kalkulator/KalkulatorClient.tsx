"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { hitungZakat, hitungZakatPertanian, hitungZakatPeternakan, formatRupiah } from "@/lib/kalkulator";
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
    { name: "total_hutang", label: "Total Hutang Jatuh Tempo (Rp)" },
    { name: "total_kebutuhan", label: "Total Kebutuhan Pokok/Pengeluaran Primer (Rp)" },
  ],
  perniagaan: [
    { name: "modal_usaha", label: "Modal Usaha Putar (Rp)" },
    { name: "keuntungan", label: "Keuntungan Bersih (Rp)" },
    { name: "hutang_jangka_pendek", label: "Hutang Usaha Jangka Pendek (Rp)" }
  ],
  pertanian: [
    { name: "jumlah_panen_kg", label: "Jumlah Hasil Panen (kg)" },
  ],
  peternakan: [
    { name: "jumlah_ternak", label: "Jumlah Ternak (ekor)" },
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

// Tabel nisab kambing untuk ditampilkan di info box
const TABEL_KAMBING = [
  { range: "< 40 ekor", zakat: "Tidak wajib zakat" },
  { range: "40–120 ekor", zakat: "1 ekor kambing" },
  { range: "121–200 ekor", zakat: "2 ekor kambing" },
  { range: "201–299 ekor", zakat: "3 ekor kambing" },
  { range: "300–399 ekor", zakat: "4 ekor kambing" },
  { range: "≥ 400 ekor", zakat: "Setiap 100 ekor = 1 ekor kambing" },
];

const TABEL_SAPI = [
  { range: "< 30 ekor", zakat: "Tidak wajib zakat" },
  { range: "30–39 ekor", zakat: "1 ekor anak sapi umur 1–2 tahun" },
  { range: "40–59 ekor", zakat: "1 ekor anak sapi umur 2–3 tahun" },
  { range: "60–69 ekor", zakat: "2 ekor anak sapi umur 1–2 tahun" },
  { range: "70–79 ekor", zakat: "1 umur 2–3 thn + 1 umur 1–2 thn" },
  { range: "80–89 ekor", zakat: "2 ekor anak sapi umur 2–3 tahun" },
  { range: "90–99 ekor", zakat: "3 ekor anak sapi umur 1–2 tahun" },
  { range: "100–109 ekor", zakat: "1 umur 2–3 thn + 2 umur 1–2 thn" },
  { range: "110–119 ekor", zakat: "2 umur 2–3 thn + 1 umur 1–2 thn" },
  { range: "≥ 120 ekor", zakat: "Setiap 30 = 1 ekor (1–2 thn), setiap 40 = 1 ekor (2–3 thn)" },
];

export default function KalkulatorClient({ nisabConfig }: { nisabConfig: NisabConfigType }) {
  const [lang, setLang] = useState<KalkulatorLanguage>("id");
  const [jenisZakat, setJenisZakat] = useState<string>("");
  const [jenisPerusahaan, setJenisPerusahaan] = useState<string>("");
  const [jenisPengairan, setJenisPengairan] = useState<string>("");
  const [jenisTernak, setJenisTernak] = useState<string>("");
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
    if (fieldName === "jumlah_panen_kg" || fieldName === "jumlah_ternak" || fieldName.includes("gram")) {
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

    if (jenisZakat === "pertanian") {
      if (!jenisPengairan) { alert(t.alertSelectPengairan); return; }
      const jumlah_panen_kg = Number(fieldValues["jumlah_panen_kg"] || 0);
      const res = hitungZakatPertanian({
        jumlah_panen_kg,
        jenis_pengairan: jenisPengairan as "irigasi" | "hujan_sungai",
      });
      setModalResult(res);
      setShowModal(true);
      return;
    }

    if (jenisZakat === "peternakan") {
      if (!jenisTernak) { alert(t.alertSelectTernak); return; }
      const jumlah_ternak = Number(fieldValues["jumlah_ternak"] || 0);
      const res = hitungZakatPeternakan({
        jumlah_ternak,
        jenis_ternak: jenisTernak as "kambing" | "sapi_kerbau",
      });
      setModalResult(res);
      setShowModal(true);
      return;
    }

    const cleanedValues: Record<string, unknown> = {};
    Object.keys(fieldValues).forEach((key) => {
      cleanedValues[key] = key.includes("gram")
        ? fieldValues[key]
        : parseRawNumber(fieldValues[key]);
    });

    const payload: Record<string, unknown> = {
      jenis_zakat: jenisZakat as JenisZakat,
      jenis_perusahaan: jenisPerusahaan as JenisPerusahaan,
      ...cleanedValues,
    };

    const res = hitungZakat(payload as Parameters<typeof hitungZakat>[0], nisabConfig);
    setModalResult(res);
    setShowModal(true);
  };

  const resetSubState = () => {
    setJenisPerusahaan("");
    setJenisPengairan("");
    setJenisTernak("");
    setFieldValues({});
  };

  const activeFields: FieldItem[] =
    jenisZakat === "perusahaan"
      ? fieldConfigPerusahaan[jenisPerusahaan] || []
      : fieldConfig[jenisZakat] || [];

  // Render info box yang relevan berdasarkan jenis zakat
  const renderInfoBox = () => {
    if (jenisZakat === "pertanian") {
      return (
        <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden">
          {/* Header strip */}
          <div className="bg-green-700 px-4 py-2.5 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-200 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-xs font-extrabold text-white tracking-wide">{t.nisabPertanianTitle}</span>
          </div>

          <div className="p-4 space-y-3">
            {/* Nisab badge */}
            <div className="bg-white rounded-xl border border-green-200 px-4 py-2.5 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nisab Minimum</p>
                <p className="text-xl font-black text-green-800">653 <span className="text-sm font-bold">kg</span></p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-700 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
            </div>

            {/* Tarif cards */}
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tarif Zakat Berdasarkan Pengairan</p>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white rounded-xl border border-green-200 px-3 py-3 shadow-sm space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-gray-600 leading-tight">Irigasi / Disiram</span>
                </div>
                <p className="text-2xl font-black text-green-700">5%</p>
                <p className="text-[10px] text-gray-500 leading-tight">Pengairan buatan / pompa</p>
              </div>
              <div className="bg-white rounded-xl border border-emerald-300 px-3 py-3 shadow-sm space-y-1.5 ring-1 ring-emerald-200">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-gray-600 leading-tight">Air Hujan / Sungai</span>
                </div>
                <p className="text-2xl font-black text-emerald-700">10%</p>
                <p className="text-[10px] text-gray-500 leading-tight">Tadah hujan / aliran sungai</p>
              </div>
            </div>

            {/* Note */}
            <p className="text-[11px] text-gray-500 leading-relaxed bg-green-100/60 rounded-lg px-3 py-2 border border-green-200/60">
              Jika hasil panen ≥ 653 kg, zakat wajib dikeluarkan dari total hasil panen sesuai tarif pengairan.
            </p>
          </div>
        </div>
      );
    }

    if (jenisZakat === "peternakan") {
      const isKambing = !jenisTernak || jenisTernak === "kambing";
      const tabel = isKambing ? TABEL_KAMBING : TABEL_SAPI;
      const title = isKambing ? t.nisabPeternakanKambingTitle : t.nisabPeternakanSapiTitle;
      return (
        <div className={`bg-amber-50/80 border-l-4 border-amber-500 p-4 rounded-r-xl text-xs sm:text-sm text-gray-800 space-y-2 ${isAr ? "border-l-0 border-r-4 rounded-r-none rounded-l-xl" : ""}`}>
          <p className="font-extrabold text-amber-800">{title}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse mt-1">
              <thead>
                <tr className="bg-amber-100">
                  <th className="text-left px-2 py-1.5 font-bold text-amber-900 border border-amber-200 rounded-tl-lg">Jumlah</th>
                  <th className="text-left px-2 py-1.5 font-bold text-amber-900 border border-amber-200 rounded-tr-lg">Zakat yang Dikeluarkan</th>
                </tr>
              </thead>
              <tbody>
                {tabel.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-amber-50/40"}>
                    <td className="px-2 py-1.5 border border-amber-100 font-medium text-gray-700">{row.range}</td>
                    <td className="px-2 py-1.5 border border-amber-100 text-amber-800 font-semibold">{row.zakat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Default: info box emas/profesi
    return (
      <div className={`bg-amber-50/70 border-l-4 border-[#FFBB0C] p-4 rounded-r-xl text-xs sm:text-sm text-gray-800 space-y-1.5 ${isAr ? "border-l-0 border-r-4 rounded-r-none rounded-l-xl" : ""}`}>
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
    );
  };

  // Render konten modal berdasarkan jenis zakat
  const renderModalContent = () => {
    if (!modalResult) return null;

    const isPertanianOrPeternakan =
      modalResult.jenis_zakat === "pertanian" || modalResult.jenis_zakat === "peternakan";

    if (!modalResult.mencapai_nisab) {
      const pesanBelum =
        modalResult.jenis_zakat === "pertanian"
          ? t.tidakWajibPertanian
          : modalResult.jenis_zakat === "peternakan"
            ? t.tidakWajibTernak
            : t.belumDesc;

      return (
        <>
          <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="text-xl font-extrabold text-gray-800">{t.belumTitle}</h4>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{pesanBelum}</p>
          <div className="pt-3 flex gap-3 justify-center">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
            >
              {t.closeModalBtn}
            </button>
            {!isPertanianOrPeternakan && (
              <Link
                href="/infaq"
                className="bg-[#FFBB0C] hover:bg-[#e8b500] text-[#000] font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-sm transition-all"
              >
                {t.bayarInfaqBtn}
              </Link>
            )}
          </div>
        </>
      );
    }

    // Wajib zakat
    const descWajib =
      modalResult.jenis_zakat === "pertanian"
        ? t.zakatPertanianWajibDesc
        : modalResult.jenis_zakat === "peternakan"
          ? t.zakatPeternakanWajibDesc
          : t.wajibDesc;

    return (
      <>
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto text-[#000]">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h4 className="text-xl font-extrabold text-[#000]">{t.wajibTitle}</h4>
        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{descWajib}</p>

        {/* Output: Peternakan → teks deskriptif */}
        {modalResult.jenis_zakat === "peternakan" && (
          <div className="text-base font-black text-amber-800 bg-amber-50 py-3 px-4 rounded-xl border border-amber-200">
            {modalResult.pesan_ternak}
          </div>
        )}

        {/* Output: Pertanian → kg */}
        {modalResult.jenis_zakat === "pertanian" && (
          <div className="text-2xl font-black text-green-800 bg-green-50 py-3 rounded-xl border border-green-200">
            {(modalResult.jumlah_zakat_kg ?? 0).toLocaleString("id-ID", { maximumFractionDigits: 2 })} {t.satuanKg}
          </div>
        )}

        {/* Output: Zakat lainnya → rupiah */}
        {!isPertanianOrPeternakan && (
          <div className="text-2xl font-black text-[#000] bg-green-50 py-3 rounded-xl border border-green-200">
            {formatRupiah(modalResult.jumlah_zakat)}
          </div>
        )}

        <div className="pt-3 flex gap-3 justify-center">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
          >
            {t.closeModalBtn}
          </button>
          {!isPertanianOrPeternakan && (
            <Link
              href={`/zakat?jenis_zakat=${modalResult.jenis_zakat}&jumlah_zakat=${modalResult.jumlah_zakat}`}
              className="bg-[#FFBB0C] hover:bg-[#e8b500] text-[#000] font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-sm transition-all"
            >
              {t.bayarZakatBtn}
            </Link>
          )}
        </div>
      </>
    );
  };

  return (
    <main
      className={`flex-grow py-10 px-4 sm:px-6 lg:px-8 max-w-[1340px] mx-auto w-full ${isAr ? "text-right" : ""}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Navigasi */}
        <Sidebar />

        {/* Konten Kalkulator */}
        <div className="lg:col-span-9 bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-gray-100 space-y-6">
          <h3 className="text-xl font-black text-[#000] border-b border-gray-100 pb-3">
            {t.pageTitle}
          </h3>

          {/* Info Box Dinamis */}
          {renderInfoBox()}

          {/* Pilih Jenis Zakat */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              {t.selectJenisZakatLabel}
            </label>
            <select
              value={jenisZakat}
              onChange={(e) => {
                setJenisZakat(e.target.value);
                resetSubState();
              }}
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0b6330] bg-white"
            >
              <option value="">{t.selectJenisZakatDefault}</option>
              <option value="maal">{t.optMaal}</option>
              <option value="emas">{t.optEmas}</option>
              <option value="profesi">{t.optProfesi}</option>
              <option value="perniagaan">{t.optPerniagaan}</option>
              <option value="perusahaan">{t.optPerusahaan}</option>
              <option value="pertanian">{t.optPertanian}</option>
              <option value="peternakan">{t.optPeternakan}</option>
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

          {/* Pilih Jenis Pengairan (hanya untuk pertanian) */}
          {jenisZakat === "pertanian" && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {t.jenisPengairanLabel}
              </label>
              <select
                value={jenisPengairan}
                onChange={(e) => setJenisPengairan(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0b6330] bg-white"
              >
                <option value="">{t.selectJenisPengairanDefault}</option>
                <option value="irigasi">{t.optIrigasi}</option>
                <option value="hujan_sungai">{t.optHujanSungai}</option>
              </select>
            </div>
          )}

          {/* Pilih Jenis Ternak (hanya untuk peternakan) */}
          {jenisZakat === "peternakan" && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {t.jenisTernakLabel}
              </label>
              <select
                value={jenisTernak}
                onChange={(e) => {
                  setJenisTernak(e.target.value);
                  setFieldValues({});
                }}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0b6330] bg-white"
              >
                <option value="">{t.selectJenisTernakDefault}</option>
                <option value="kambing">{t.optKambing}</option>
                <option value="sapi_kerbau">{t.optSapiKerbau}</option>
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
                    type="number"
                    value={fieldValues[field.name] || ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    placeholder={t.inputPlaceholder}
                    min={0}
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
            {renderModalContent()}
          </div>
        </div>
      )}
    </main>
  );
}
