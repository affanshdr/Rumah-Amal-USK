import Link from 'next/link';

export default function UploadIndexPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      background: '#f3f4f6',
      padding: '1rem',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '480px', width: '100%' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛠️</div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: '0 0 0.4rem' }}>
          Upload Tools
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Halaman ini hanya untuk kebutuhan internal. Hapus setelah selesai digunakan.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link href="/upload/galeri" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            background: 'white',
            border: '1.5px solid #e5e7eb',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            textDecoration: 'none',
            color: 'inherit',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}>
            <span style={{ fontSize: '2rem' }}>🖼️</span>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontWeight: 700, color: '#111827', margin: 0, fontSize: '0.95rem' }}>
                Upload Galeri
              </p>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.8rem' }}>
                Upload banyak foto sekaligus ke storage
              </p>
            </div>
            <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: '1.1rem' }}>→</span>
          </Link>

          <Link href="/upload/newsletter" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            background: 'white',
            border: '1.5px solid #e5e7eb',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            textDecoration: 'none',
            color: 'inherit',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}>
            <span style={{ fontSize: '2rem' }}>📰</span>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontWeight: 700, color: '#111827', margin: 0, fontSize: '0.95rem' }}>
                Upload Newsletter
              </p>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.8rem' }}>
                Tambah edisi newsletter dengan judul & tanggal
              </p>
            </div>
            <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: '1.1rem' }}>→</span>
          </Link>

          <Link href="/upload/mitra" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            background: 'white',
            border: '1.5px solid #e5e7eb',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            textDecoration: 'none',
            color: 'inherit',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}>
            <span style={{ fontSize: '2rem' }}>🤝</span>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontWeight: 700, color: '#111827', margin: 0, fontSize: '0.95rem' }}>
                Upload Mitra
              </p>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.8rem' }}>
                Tambah logo/gambar & nama mitra resmi
              </p>
            </div>
            <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: '1.1rem' }}>→</span>
          </Link>

          <Link href="/upload/dokumen" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            background: 'white',
            border: '1.5px solid #e5e7eb',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            textDecoration: 'none',
            color: 'inherit',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}>
            <span style={{ fontSize: '2rem' }}>📄</span>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontWeight: 700, color: '#111827', margin: 0, fontSize: '0.95rem' }}>
                Upload Dokumen
              </p>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.8rem' }}>
                Upload dokumen PDF dengan cover image & tanggal
              </p>
            </div>
            <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: '1.1rem' }}>→</span>
          </Link>

          <Link href="/upload/kampanye" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            background: 'white',
            border: '1.5px solid #e5e7eb',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            textDecoration: 'none',
            color: 'inherit',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}>
            <span style={{ fontSize: '2rem' }}>🎯</span>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontWeight: 700, color: '#111827', margin: 0, fontSize: '0.95rem' }}>
                Upload Kampanye
              </p>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.8rem' }}>
                Tambah program kampanye baru dengan target dana &amp; foto
              </p>
            </div>
            <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: '1.1rem' }}>→</span>
          </Link>

          <Link href="/upload/program" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            background: 'white',
            border: '1.5px solid #e5e7eb',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            textDecoration: 'none',
            color: 'inherit',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}>
            <span style={{ fontSize: '2rem' }}>📌</span>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontWeight: 700, color: '#111827', margin: 0, fontSize: '0.95rem' }}>
                Upload / Kelola Program
              </p>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.8rem' }}>
                Tambah &amp; kelola program kerja berdasarkan kategori
              </p>
            </div>
            <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: '1.1rem' }}>→</span>
          </Link>

          <Link href="/upload/berita" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            background: 'white',
            border: '1.5px solid #e5e7eb',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            textDecoration: 'none',
            color: 'inherit',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}>
            <span style={{ fontSize: '2rem' }}>📰</span>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontWeight: 700, color: '#111827', margin: 0, fontSize: '0.95rem' }}>
                Upload / Buat Berita
              </p>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.8rem' }}>
                Editor TipTap untuk membuat berita & upload cover/PDF
              </p>
            </div>
            <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: '1.1rem' }}>→</span>
          </Link>

          <Link href="/upload/pengumuman" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            background: 'white',
            border: '1.5px solid #e5e7eb',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            textDecoration: 'none',
            color: 'inherit',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}>
            <span style={{ fontSize: '2rem' }}>📢</span>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontWeight: 700, color: '#111827', margin: 0, fontSize: '0.95rem' }}>
                Upload / Buat Pengumuman
              </p>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.8rem' }}>
                Editor TipTap untuk membuat pengumuman & upload cover
              </p>
            </div>
            <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: '1.1rem' }}>→</span>
          </Link>
        </div>

        <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#d1d5db' }}>
          /upload — bukan bagian dari halaman publik
        </p>
      </div>
    </div>
  );
}
