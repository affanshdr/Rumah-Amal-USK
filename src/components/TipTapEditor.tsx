'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle, Color } from '@tiptap/extension-text-style';
import { Link } from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Node, mergeAttributes } from '@tiptap/core';
import { useRef, useState, useCallback } from 'react';

// ─── Custom Download Button Node ────────────────────────────────────────────
export const DownloadButtonNode = Node.create({
  name: 'downloadButton',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      url: { default: null },
      label: { default: '📄 DOWNLOAD PENGUMUMAN (PDF)' },
    };
  },

  parseHTML() {
    return [{ tag: 'a[data-type="download-button"]' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      'div',
      { class: 'my-4' },
      [
        'a',
        mergeAttributes(
          {
            'data-type': 'download-button',
            href: node.attrs.url,
            target: '_blank',
            rel: 'noopener noreferrer',
            download: '',
            style: [
              'display:inline-flex',
              'align-items:center',
              'gap:8px',
              'background:#0b6330',
              'color:#fff',
              'padding:11px 22px',
              'border-radius:8px',
              'font-weight:700',
              'text-decoration:none',
              'font-size:14px',
              'box-shadow:0 2px 8px rgba(11,99,48,.25)',
            ].join(';'),
          },
          HTMLAttributes
        ),
        node.attrs.label || '📄 DOWNLOAD PENGUMUMAN (PDF)',
      ],
    ];
  },

  addCommands() {
    return {
      setDownloadButton:
        (options: { url: string; label?: string }) =>
        ({ commands }: any) =>
          commands.insertContent({ type: this.name, attrs: options }),
    } as any;
  },
});

// ─── Toolbar Icon Button ─────────────────────────────────────────────────────
function ToolBtn({
  active,
  disabled,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={[
        'flex items-center justify-center w-8 h-8 rounded-md text-[13px] transition-all',
        'border border-transparent select-none shrink-0',
        active
          ? 'bg-[#0b6330] text-white shadow-sm'
          : 'text-gray-700 hover:bg-gray-100 hover:border-gray-200',
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
function Sep() {
  return <div className="w-px h-5 bg-gray-200 mx-0.5 shrink-0" />;
}

// ─── Props ───────────────────────────────────────────────────────────────────
interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  /** Dipanggil setiap kali file berhasil diupload. Parent dapat melacak path ini untuk cleanup. */
  onUpload?: (url: string, storagePath: string) => void;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function TipTapEditor({ content, onChange, onUpload }: TipTapEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadLabel, setUploadLabel] = useState('');
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full my-3 h-auto border border-gray-100 shadow-sm',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-600 underline cursor-pointer' },
      }),
      Placeholder.configure({ placeholder: 'Tulis isi pengumuman di sini…' }),
      DownloadButtonNode,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // ── Upload helpers ──────────────────────────────────────────────────────
  const uploadFile = useCallback(async (file: File): Promise<{ url: string; storagePath: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Upload gagal');
    }
    const data = await res.json();
    return { url: data.url as string, storagePath: data.storagePath as string };
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    setUploading(true);
    setUploadLabel('Mengupload gambar…');
    try {
      const { url, storagePath } = await uploadFile(file);
      editor.chain().focus().setImage({ src: url }).run();
      onUpload?.(url, storagePath); // Beritahu parent untuk tracking
    } catch (err) {
      alert(`Gagal upload gambar: ${(err as Error).message}`);
    } finally {
      setUploading(false);
      setUploadLabel('');
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const label = window.prompt(
      'Label pada tombol download PDF:',
      `📄 DOWNLOAD ${file.name.toUpperCase()}`
    );
    setUploading(true);
    setUploadLabel('Mengupload PDF…');
    try {
      const { url, storagePath } = await uploadFile(file);
      (editor.commands as any).setDownloadButton({
        url,
        label: label || `📄 DOWNLOAD ${file.name.toUpperCase()}`,
      });
      onUpload?.(url, storagePath); // Beritahu parent untuk tracking
    } catch (err) {
      alert(`Gagal upload PDF: ${(err as Error).message}`);
    } finally {
      setUploading(false);
      setUploadLabel('');
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  const applyLink = () => {
    if (!editor) return;
    const url = linkUrl.trim();
    if (!url) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .setLink({ href: url.startsWith('http') ? url : `https://${url}` })
        .run();
    }
    setLinkDialogOpen(false);
    setLinkUrl('');
  };

  if (!editor) return null;

  const headingLevel = editor.isActive('heading', { level: 1 })
    ? '1'
    : editor.isActive('heading', { level: 2 })
    ? '2'
    : editor.isActive('heading', { level: 3 })
    ? '3'
    : '0';

  return (
    <div className="border border-gray-300 rounded-xl overflow-visible bg-white shadow-sm">
      {/* ── Hidden file inputs ─────────────────────────────────────── */}
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      <input ref={pdfInputRef} type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} />

      {/* ── Toolbar ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 bg-gray-50 border-b border-gray-200 rounded-t-xl">

        {/* Paragraph / Heading selector */}
        <select
          value={headingLevel}
          onChange={(e) => {
            const v = e.target.value;
            if (v === '0') editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: Number(v) as 1 | 2 | 3 }).run();
          }}
          className="h-8 px-2 text-[12px] font-semibold text-gray-700 bg-white border border-gray-200 rounded-md cursor-pointer focus:outline-none hover:border-gray-300 mr-1"
        >
          <option value="0">Normal</option>
          <option value="1">Judul Besar (H1)</option>
          <option value="2">Judul Sedang (H2)</option>
          <option value="3">Judul Kecil (H3)</option>
        </select>

        <Sep />

        {/* Bold */}
        <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Tebal (Ctrl+B)">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M6 4h8a4 4 0 0 1 0 8H6V4zm0 8h9a4 4 0 0 1 0 8H6v-8z"/></svg>
        </ToolBtn>

        {/* Italic */}
        <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Miring (Ctrl+I)">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M10 4v3h2.21l-3.42 10H6v3h8v-3h-2.21l3.42-10H18V4z"/></svg>
        </ToolBtn>

        {/* Underline */}
        <ToolBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Garis Bawah (Ctrl+U)">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/></svg>
        </ToolBtn>

        {/* Strikethrough */}
        <ToolBtn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Coret">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M6.85 7.08C6.85 4.37 9.45 3 12.24 3c1.64 0 3 .49 3.9 1.28.77.65 1.46 1.73 1.46 3.24h-3.01c0-.31-.05-.59-.15-.85-.29-.86-1.2-1.28-2.25-1.28-1.86 0-2.34.92-2.34 1.67 0 .09.01.18.03.27H6.85v-.25zm5.15 8.42h3.12c.07.26.1.52.1.8 0 1.88-1.57 3.7-4.62 3.7-3.28 0-5.2-2.14-5.2-4.54H8.4c0 1.29.86 2.51 2.75 2.51 2.09 0 2.85-1.26 2.85-2.47zm-8 .5h16v-2H4v2z"/></svg>
        </ToolBtn>

        <Sep />

        {/* Text Align */}
        <ToolBtn active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Rata Kiri">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M3 21h18v-2H3v2zm0-4h12v-2H3v2zm0-4h18v-2H3v2zm0-4h12v-2H3v2zm0-4h18V3H3v2z"/></svg>
        </ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Rata Tengah">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"/></svg>
        </ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Rata Kanan">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/></svg>
        </ToolBtn>

        <Sep />

        {/* Bullet list */}
        <ToolBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Daftar Bullet">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>
        </ToolBtn>

        {/* Ordered list */}
        <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Daftar Angka">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/></svg>
        </ToolBtn>

        {/* Blockquote */}
        <ToolBtn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Kutipan">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>
        </ToolBtn>

        <Sep />

        {/* Link */}
        <ToolBtn
          active={editor.isActive('link')}
          onClick={() => {
            const prev = editor.getAttributes('link').href || '';
            setLinkUrl(prev);
            setLinkDialogOpen(true);
          }}
          title="Sisipkan Link"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
        </ToolBtn>

        {/* Unlink */}
        {editor.isActive('link') && (
          <ToolBtn onClick={() => editor.chain().focus().unsetLink().run()} title="Hapus Link">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M17 7h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1 0 1.43-.97 2.63-2.28 3.01L19.2 16.4C20.87 15.61 22 13.93 22 12c0-2.76-2.24-5-5-5zm-1 4h-2.19l2 2H16v-2zM2 4.27l3.11 3.11A4.991 4.991 0 0 0 2 12c0 2.76 2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1 0-1.59 1.21-2.9 2.76-3.07L8.73 11H8v2h2.73L13 15.27V17h1.73l2.54 2.54L18.73 18 3.27 2.54 2 4.27z"/></svg>
          </ToolBtn>
        )}

        <Sep />

        {/* Insert Image */}
        <button
          type="button"
          title="Sisipkan Gambar"
          disabled={uploading}
          onClick={() => imageInputRef.current?.click()}
          className="flex items-center gap-1.5 h-8 px-2.5 text-[12px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
          Gambar
        </button>

        {/* Insert PDF button */}
        <button
          type="button"
          title="Sisipkan Tombol Download PDF"
          disabled={uploading}
          onClick={() => pdfInputRef.current?.click()}
          className="flex items-center gap-1.5 h-8 px-2.5 text-[12px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-md hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/></svg>
          Tombol PDF
        </button>

        {/* Upload indicator */}
        {uploading && (
          <span className="ml-2 text-[11px] text-amber-600 font-semibold animate-pulse">
            ⏳ {uploadLabel}
          </span>
        )}
      </div>

      {/* ── Link Dialog ───────────────────────────────────────────── */}
      {linkDialogOpen && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-b border-blue-200">
          <span className="text-xs font-bold text-blue-700 shrink-0">URL Link:</span>
          <input
            type="url"
            autoFocus
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') applyLink(); if (e.key === 'Escape') setLinkDialogOpen(false); }}
            placeholder="https://contoh.com"
            className="flex-1 text-sm px-2.5 py-1.5 border border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
          />
          <button type="button" onClick={applyLink} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 cursor-pointer">
            Terapkan
          </button>
          <button type="button" onClick={() => setLinkDialogOpen(false)} className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-300 cursor-pointer">
            Batal
          </button>
        </div>
      )}

      {/* ── Editor Area ───────────────────────────────────────────── */}
      <style>{`
        .tiptap-editor-area .tiptap { outline: none; min-height: 340px; }
        .tiptap-editor-area .tiptap p { margin: 0.5em 0; line-height: 1.75; }
        .tiptap-editor-area .tiptap h1 { font-size: 1.6rem; font-weight: 800; margin: 1rem 0 0.5rem; line-height: 1.3; }
        .tiptap-editor-area .tiptap h2 { font-size: 1.3rem; font-weight: 700; margin: 0.9rem 0 0.4rem; line-height: 1.35; }
        .tiptap-editor-area .tiptap h3 { font-size: 1.1rem; font-weight: 700; margin: 0.8rem 0 0.35rem; }
        .tiptap-editor-area .tiptap ul { list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
        .tiptap-editor-area .tiptap ol { list-style-type: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
        .tiptap-editor-area .tiptap li { margin: 0.2rem 0; }
        .tiptap-editor-area .tiptap blockquote { border-left: 4px solid #d1d5db; padding-left: 1rem; color: #6b7280; font-style: italic; margin: 0.75rem 0; }
        .tiptap-editor-area .tiptap a { color: #2563eb; text-decoration: underline; }
        .tiptap-editor-area .tiptap p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #9ca3af; pointer-events: none; float: left; height: 0; }
        .tiptap-editor-area .tiptap strong { font-weight: 700; }
        .tiptap-editor-area .tiptap em { font-style: italic; }
        .tiptap-editor-area .tiptap s { text-decoration: line-through; }
        .tiptap-editor-area .tiptap u { text-decoration: underline; }
      `}</style>

      <div className="tiptap-editor-area p-5 overflow-y-auto max-h-[560px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
