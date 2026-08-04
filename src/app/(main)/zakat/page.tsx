"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { submitZakat } from "@/actions/zakat";

function ZakatFormContent() {
  const searchParams = useSearchParams();
  const [tipePembayar, setTipePembayar] = useState<"masyarakat" | "dosen">("masyarakat");
  const [jenisZakat, setJenisZakat] = useState<string>("");
  const [sumberDana, setSumberDana] = useState<string>("");
  const [jenisPerusahaan, setJenisPerusahaan] = useState<string>("");
  const [jumlahZakat, setJumlahZakat] = useState<string>("");
  const [nama, setNama] = useState<string>("");
  const [isHambaAllah, setIsHambaAllah] = useState<boolean>(false);
  const [nip, setNip] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [alamat, setAlamat] = useState<string>(" Banda Aceh");
  const [noHp, setNoHp] = useState<string>("");
  const [bersediaDihubungi, setBersediaDihubungi] = useState<boolean>(false);
  const [pesan, setPesan] = useState<string>("");
  const [setujuTerms, setSetujuTerms] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("File...");
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const jZakat = searchParams.get("jenis_zakat");
    const jlZakat = searchParams.get("jumlah_zakat");

    if (jZakat) setJenisZakat(jZakat);
    if (jlZakat) setJumlahZakat(jlZakat);
  }, [searchParams]);

  const handleTipeSwitch = (tipe: "dosen" | "masyarakat") => {
    setTipePembayar(tipe);
    if (tipe === "dosen") {
      setIsHambaAllah(false);
    }
  };

  const handleHambaAllahChange = (checked: boolean) => {
    setIsHambaAllah(checked);
    if (checked) {
      setNama("Hamba Allah");
    } else {
      setNama("");
    }
  };

  return (
    <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8 max-w-[1340px] mx-auto w-full">

      {/* Selector Tab Tipe Pembayar */}
      <div className="text-center mb-8">
        <div className="inline-flex rounded-xl p-1 bg-gray-200/80 shadow-inner">
          <button
            type="button"
            onClick={() => handleTipeSwitch("dosen")}
            className={`text-xs sm:text-sm font-extrabold px-8 py-2.5 rounded-lg transition-all cursor-pointer ${tipePembayar === "dosen"
              ? "bg-[#FFBB0C] text-[#000] shadow-sm"
              : "text-gray-600 hover:text-[#000]"
              }`}
          >
            Dosen / Pegawai USK
          </button>
          <button
            type="button"
            onClick={() => handleTipeSwitch("masyarakat")}
            className={`text-xs sm:text-sm font-extrabold px-8 py-2.5 rounded-lg transition-all cursor-pointer ${tipePembayar === "masyarakat"
              ? "bg-[#FFBB0C] text-[#000] shadow-sm"
              : "text-gray-600 hover:text-[#000]"
              }`}
          >
            Masyarakat Umum
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Sidebar Navigasi */}
        <Sidebar />

        {/* Form Pembayaran Tengah */}
        <form action={submitZakat} onSubmit={() => setSubmitting(true)} className="contents">
          <input type="hidden" name="tipe_pembayar" value={tipePembayar} />

          <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-2xl shadow-md border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-[#000]">Formulir Pembayaran Zakat</h3>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-[#000] uppercase">
                {tipePembayar}
              </span>
            </div>

            {/* Jenis Zakat */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Jenis Zakat <span className="text-red-500">*</span></label>
              <select
                name="jenis_zakat"
                value={jenisZakat}
                onChange={(e) => setJenisZakat(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0b6330] focus:ring-1 focus:ring-[#0b6330] transition-all bg-white"
              >
                <option value="">-- Pilih Jenis Zakat --</option>
                <option value="maal">Zakat Maal</option>
                <option value="emas">Zakat Emas</option>
                <option value="profesi">Zakat Profesi</option>
                <option value="perniagaan">Zakat Perniagaan</option>
                <option value="perusahaan">Zakat Perusahaan</option>
              </select>
            </div>

            {/* Sumber Dana (Tampil jika Jenis Zakat = Profesi) */}
            {jenisZakat === "profesi" && (
              <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/70">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Sumber Dana (Zakat Profesi)</label>
                <select
                  name="sumber_dana"
                  value={sumberDana}
                  onChange={(e) => setSumberDana(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0b6330] bg-white"
                >
                  <option value="">-- Pilih Sumber Dana --</option>
                  <option value="remunerasi">Remunerasi</option>
                  <option value="serdos">Sertifikasi Dosen (Serdos)</option>
                  <option value="penghasilan_bulanan">Penghasilan Bulanan</option>
                  <option value="sertifikasi_profesor">Sertifikasi Profesor</option>
                  <option value="seluruh_dana">Seluruh Kategori / Seluruh Dana</option>
                </select>
              </div>
            )}

            {/* Jenis Perusahaan (Tampil jika Jenis Zakat = Perusahaan) */}
            {jenisZakat === "perusahaan" && (
              <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/70">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Jenis Perusahaan</label>
                <select
                  name="jenis_perusahaan"
                  value={jenisPerusahaan}
                  onChange={(e) => setJenisPerusahaan(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0b6330] bg-white"
                >
                  <option value="">-- Pilih Jenis Perusahaan --</option>
                  <option value="dagang_industri">Perusahaan Dagang / Industri</option>
                  <option value="jasa">Perusahaan Jasa</option>
                </select>
              </div>
            )}

            {/* Jumlah Zakat */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Jumlah Zakat <span className="text-red-500">*</span></label>
              <div className="flex rounded-xl shadow-2xs overflow-hidden border border-gray-300 focus-within:border-[#0b6330] focus-within:ring-1 focus-within:ring-[#0b6330]">
                <span className="inline-flex items-center px-4 bg-gray-100 text-gray-600 text-xs font-bold border-r border-gray-300">
                  Rp.
                </span>
                <input
                  type="number"
                  name="jumlah_zakat"
                  value={jumlahZakat}
                  onChange={(e) => setJumlahZakat(e.target.value)}
                  required
                  placeholder="Jumlah yang ingin dibayarkan"
                  className="flex-1 block w-full px-3.5 py-2.5 text-sm focus:outline-none bg-white"
                />
              </div>
            </div>

            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="nama"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                readOnly={isHambaAllah}
                required
                placeholder="Nama Lengkap Pembayar Zakat"
                className={`w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0b6330] transition-all ${isHambaAllah ? "bg-gray-100 text-gray-500" : "bg-white"
                  }`}
              />
            </div>

            {/* Opsi Masyarakat: Checkbox Hamba Allah */}
            {tipePembayar === "masyarakat" && (
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="anon-check"
                  name="is_hamba_allah"
                  value="1"
                  checked={isHambaAllah}
                  onChange={(e) => handleHambaAllahChange(e.target.checked)}
                  className="w-4 h-4 text-[#000] rounded focus:ring-[#0b6330] cursor-pointer"
                />
                <label htmlFor="anon-check" className="text-xs text-gray-600 font-semibold cursor-pointer">
                  Sembunyikan nama saya (Hamba Allah)
                </label>
              </div>
            )}

            {/* Opsi Dosen: NIP */}
            {tipePembayar === "dosen" && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">NIP / NIDN</label>
                <input
                  type="text"
                  name="nip"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  placeholder="Nomor Induk Pegawai / Dosen USK"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0b6330] bg-white"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Contoh: nama@gmail.com"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0b6330] bg-white"
              />
            </div>

            {/* Alamat */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Alamat</label>
              <input
                type="text"
                name="alamat"
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                placeholder="Alamat Tinggal / Domisili"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0b6330] bg-white"
              />
            </div>

            {/* No. Telepon */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">No. Telepon / WhatsApp</label>
              <input
                type="text"
                name="no_hp"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                placeholder="Contoh: 08123456789"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0b6330] bg-white"
              />
            </div>

            {/* Checkbox Hubungi Kembali */}
            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="agree-contact"
                name="bersedia_dihubungi"
                value="1"
                checked={bersediaDihubungi}
                onChange={(e) => setBersediaDihubungi(e.target.checked)}
                className="w-4 h-4 text-[#000] rounded focus:ring-[#0b6330] mt-0.5 cursor-pointer"
              />
              <label htmlFor="agree-contact" className="text-xs text-gray-600 leading-snug cursor-pointer">
                Bersedia dihubungi oleh tim Rumah Amal USK mengenai bukti penyaluran
              </label>
            </div>

            {/* Pesan */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Doa / Pesan</label>
              <textarea
                name="pesan"
                rows={3}
                value={pesan}
                onChange={(e) => setPesan(e.target.value)}
                placeholder="Tulis doa atau niat zakat..."
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0b6330] bg-white"
              />
            </div>

          </div>

          {/* Kolom Kanan: Metode Pembayaran */}
          <div className="lg:col-span-4 bg-white p-6 sm:p-7 rounded-2xl shadow-md border border-gray-100 space-y-5">
            <h3 className="text-lg font-black text-[#000] border-b border-gray-100 pb-3">
              Metode Pembayaran
            </h3>

            {/* Card Scan QRIS */}
            <div className="text-center py-5 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-xs font-extrabold text-gray-700 mb-3 tracking-wider uppercase">
                Scan QRIS Rumah Amal USK
              </p>
              <div className="w-40 h-40 mx-auto bg-white p-3 border border-gray-100 rounded-xl shadow-xs flex items-center justify-center">
                <svg className="w-36 h-36" viewBox="0 0 100 100">
                  <rect x="5" y="5" width="25" height="25" fill="none" stroke="#0b6330" strokeWidth="6" />
                  <rect x="70" y="5" width="25" height="25" fill="none" stroke="#0b6330" strokeWidth="6" />
                  <rect x="5" y="70" width="25" height="25" fill="none" stroke="#0b6330" strokeWidth="6" />
                  <rect x="12" y="12" width="11" height="11" fill="#0b6330" />
                  <rect x="77" y="12" width="11" height="11" fill="#0b6330" />
                  <rect x="12" y="77" width="11" height="11" fill="#0b6330" />
                  <rect x="38" y="10" width="8" height="8" fill="#111" />
                  <rect x="52" y="18" width="12" height="6" fill="#111" />
                  <rect x="38" y="32" width="15" height="8" fill="#111" />
                  <rect x="10" y="45" width="25" height="12" fill="#111" />
                  <rect x="42" y="48" width="18" height="18" fill="#111" />
                  <rect x="70" y="40" width="22" height="10" fill="#111" />
                  <rect x="75" y="60" width="12" height="25" fill="#111" />
                  <rect x="38" y="75" width="20" height="15" fill="#111" />
                </svg>
              </div>
              <p className="text-[11px] text-gray-500 mt-3">
                Transfer via Bank BSI No. Rek <strong>7099400409</strong> a.n. Rumah Amal USK
              </p>
            </div>

            {/* Upload Bukti Pembayaran */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Upload Bukti Transfer / Pembayaran</label>
              <div className="flex items-center justify-between border border-gray-300 rounded-xl p-2 bg-gray-50/80">
                <input
                  type="file"
                  id="bukti-pembayaran"
                  name="bukti_pembayaran"
                  className="hidden"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name || "File...")}
                />
                <span className="text-xs text-gray-500 truncate px-2 max-w-[200px]">{fileName}</span>
                <button
                  type="button"
                  onClick={() => document.getElementById("bukti-pembayaran")?.click()}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Pilih File...
                </button>
              </div>
            </div>

            {/* Setuju Syarat & Ketentuan */}
            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                name="setuju_terms"
                value="1"
                checked={setujuTerms}
                onChange={(e) => setSetujuTerms(e.target.checked)}
                required
                className="w-4 h-4 text-[#000] rounded focus:ring-[#0b6330] mt-0.5 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-gray-600 leading-snug cursor-pointer">
                Saya menyetujui syarat dan ketentuan niat & pembayaran zakat di Rumah Amal USK
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#FFBB0C] hover:bg-[#e8b500] text-[#000] font-black py-3.5 rounded-xl text-sm shadow-md transition-all duration-200 hover:shadow-lg cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Memproses Pembayaran..." : "Lanjutkan Pembayaran Zakat"}
            </button>
          </div>
        </form>

      </div>
    </main>
  );
}

export default function ZakatPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm font-semibold">Memuat formulir zakat...</div>}>
      <ZakatFormContent />
    </Suspense>
  );
}
