"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { submitDonasi } from "@/actions/donasi";
import { Kampanye } from "@prisma/client";

export default function DonasiClient({ programs }: { programs: Kampanye[] }) {
  const searchParams = useSearchParams();
  const programFromUrl = searchParams.get("program");

  const [tipePembayar, setTipePembayar] = useState<"masyarakat" | "dosen">("masyarakat");

  // Set default jenisDonasi to the first program if available
  const defaultProgram = programs.length > 0 ? programs[0].judul : "Umum";
  const [jenisDonasi, setJenisDonasi] = useState<string>(defaultProgram);

  useEffect(() => {
    if (programFromUrl) {
      const match = programs.find((p) => p.judul.trim().toLowerCase() === programFromUrl.trim().toLowerCase());
      if (match) {
        setJenisDonasi(match.judul);
      } else {
        setJenisDonasi(programFromUrl);
      }
    }
  }, [programFromUrl, programs]);

  const [jumlahDonasi, setJumlahDonasi] = useState<string>("");
  const [nama, setNama] = useState<string>("");
  const [isHambaAllah, setIsHambaAllah] = useState<boolean>(false);
  const [nip, setNip] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [alamat, setAlamat] = useState<string>("");
  const [noHp, setNoHp] = useState<string>("");
  const [bersediaDihubungi, setBersediaDihubungi] = useState<boolean>(false);
  const [pesan, setPesan] = useState<string>("");
  const [setujuTerms, setSetujuTerms] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("File...");
  const [submitting, setSubmitting] = useState<boolean>(false);

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
        <form action={submitDonasi} onSubmit={() => setSubmitting(true)} className="contents">
          <input type="hidden" name="tipe_pembayar" value={tipePembayar} />

          <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-2xl shadow-md border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-[#000]">Formulir Pembayaran Donasi</h3>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-[#000] uppercase">
                {tipePembayar}
              </span>
            </div>

            {/* Jenis Donasi Dinamis */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Kategori Program Donasi <span className="text-red-500">*</span></label>
              <select
                name="jenis_donasi"
                value={jenisDonasi}
                onChange={(e) => setJenisDonasi(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#005621] bg-white font-semibold"
              >
                {programs.length === 0 ? (
                  <option value="Umum">Donasi Umum</option>
                ) : (
                  programs.map((prog) => (
                    <option key={prog.id} value={prog.judul}>{prog.judul}</option>
                  ))
                )}
              </select>
              {programs.find(p => p.judul === jenisDonasi)?.deskripsi && (
                <p className="mt-1.5 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100">
                  {programs.find(p => p.judul === jenisDonasi)?.deskripsi}
                </p>
              )}
            </div>

            {/* Jumlah Donasi */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Jumlah Donasi <span className="text-red-500">*</span></label>
              <div className="flex rounded-xl shadow-2xs overflow-hidden border border-gray-300 focus-within:border-[#005621]">
                <span className="inline-flex items-center px-4 bg-gray-100 text-gray-600 text-xs font-bold border-r border-gray-300">
                  Rp.
                </span>
                <input
                  type="number"
                  name="jumlah_donasi"
                  value={jumlahDonasi}
                  onChange={(e) => setJumlahDonasi(e.target.value)}
                  required
                  placeholder="Jumlah donasi yang ingin disalurkan"
                  className="flex-1 block w-full px-3.5 py-2.5 text-sm focus:outline-none bg-white font-bold"
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
                placeholder="Nama Lengkap Donatur"
                className={`w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#005621] ${isHambaAllah ? "bg-gray-100 text-gray-500" : "bg-white"
                  }`}
              />
            </div>

            {/* Opsi Masyarakat: Checkbox Hamba Allah */}
            {tipePembayar === "masyarakat" && (
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="anon-check-donasi"
                  name="is_hamba_allah"
                  value="1"
                  checked={isHambaAllah}
                  onChange={(e) => handleHambaAllahChange(e.target.checked)}
                  className="w-4 h-4 text-[#000] rounded focus:ring-[#005621] cursor-pointer"
                />
                <label htmlFor="anon-check-donasi" className="text-xs text-gray-600 font-semibold cursor-pointer">
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
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#005621] bg-white"
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
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#005621] bg-white"
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
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#005621] bg-white"
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
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#005621] bg-white"
              />
            </div>

            {/* Checkbox Hubungi Kembali */}
            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="agree-contact-donasi"
                name="bersedia_dihubungi"
                value="1"
                checked={bersediaDihubungi}
                onChange={(e) => setBersediaDihubungi(e.target.checked)}
                className="w-4 h-4 text-[#000] rounded focus:ring-[#005621] mt-0.5 cursor-pointer"
              />
              <label htmlFor="agree-contact-donasi" className="text-xs text-gray-600 leading-snug cursor-pointer">
                Bersedia dihubungi oleh Rumah Amal USK mengenai update penggunaan donasi
              </label>
            </div>

            {/* Pesan */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Doa / Harapan</label>
              <textarea
                name="pesan"
                rows={3}
                value={pesan}
                onChange={(e) => setPesan(e.target.value)}
                placeholder="Tulis doa atau niat baik untuk keberkahan donasi ini..."
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#005621] bg-white"
              />
            </div>

          </div>

          {/* Kolom Kanan: Metode Pembayaran */}
          <div className="lg:col-span-4 bg-white p-6 sm:p-7 rounded-2xl shadow-md border border-gray-100 space-y-5">
            <h3 className="text-lg font-black text-[#000] border-b border-gray-100 pb-3">
              Metode Pembayaran
            </h3>

            {/* Card Scan QRIS */}
            <div className="text-center py-5 px-4 bg-amber-50/50 rounded-2xl border border-dashed border-amber-200">
              <p className="text-xs font-extrabold text-gray-700 mb-3 tracking-wider uppercase">
                Scan QRIS Rumah Amal USK
              </p>
              <div className="w-40 h-40 mx-auto bg-white p-3 border border-gray-100 rounded-xl shadow-xs flex items-center justify-center">
                <svg className="w-36 h-36" viewBox="0 0 100 100">
                  <rect x="5" y="5" width="25" height="25" fill="none" stroke="#005621" strokeWidth="6" />
                  <rect x="70" y="5" width="25" height="25" fill="none" stroke="#005621" strokeWidth="6" />
                  <rect x="5" y="70" width="25" height="25" fill="none" stroke="#005621" strokeWidth="6" />
                  <rect x="12" y="12" width="11" height="11" fill="#005621" />
                  <rect x="77" y="12" width="11" height="11" fill="#005621" />
                  <rect x="12" y="77" width="11" height="11" fill="#005621" />
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
                  id="bukti-donasi"
                  name="bukti_pembayaran"
                  className="hidden"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name || "File...")}
                />
                <span className="text-xs text-gray-500 truncate px-2 max-w-[200px]">{fileName}</span>
                <button
                  type="button"
                  onClick={() => document.getElementById("bukti-donasi")?.click()}
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
                id="terms-donasi"
                name="setuju_terms"
                value="1"
                checked={setujuTerms}
                onChange={(e) => setSetujuTerms(e.target.checked)}
                required
                className="w-4 h-4 text-[#000] rounded focus:ring-[#005621] mt-0.5 cursor-pointer"
              />
              <label htmlFor="terms-donasi" className="text-xs text-gray-600 leading-snug cursor-pointer">
                Saya menyetujui syarat dan ketentuan donasi di Rumah Amal USK
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#FFBB0C] hover:bg-[#e8b500] text-[#000] font-black py-3.5 rounded-xl text-sm shadow-md transition-all duration-200 hover:shadow-lg cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Memproses Donasi..." : "Lanjutkan Pembayaran Donasi"}
            </button>
          </div>
        </form>

      </div>
    </main>
  );
}
