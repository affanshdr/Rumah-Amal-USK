'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import { Node, mergeAttributes } from '@tiptap/core';
import { useRef, useState } from 'react';

// 1. Custom TipTap Node untuk Tombol Download PDF (Hijau)
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
      { class: 'my-4 text-left' },
      [
        'a',
        mergeAttributes(
          {
            'data-type': 'download-button',
            href: node.attrs.url,
            target: '_blank',
            rel: 'noopener noreferrer',
            download: '',
            style:
              'display: inline-flex; align-items: center; gap: 8px; background-color: #0b6330; color: #ffffff; padding: 12px 24px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 14px; box-shadow: 0 2px 8px rgba(11,99,48,0.2); transition: background-color 0.2s;',
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
        ({ commands }: any) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension.configure({
        HTMLAttributes: {
          class: 'rounded-xl max-w-full my-4 h-auto shadow-xs border border-gray-100',
        },
      }),
      DownloadButtonNode,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  // Handler Upload Gambar (Disisipkan ke posisi kursor)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Gagal upload gambar: ${err.error}`);
        return;
      }

      const data = await res.json();
      editor.chain().focus().setImage({ src: data.url }).run();
    } catch (err) {
      alert(`Terjadi kesalahan: ${(err as Error).message}`);
    } finally {
      setUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  // Handler Upload PDF -> Sisipkan Tombol Hijau Custom
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const customLabel = prompt(
      'Masukkan teks tombol download (opsional):',
      `📄 DOWNLOAD ${file.name.toUpperCase()}`
    );

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Gagal upload PDF: ${err.error}`);
        return;
      }

      const data = await res.json();
      // Sisipkan custom node tombol hijau
      (editor.commands as any).setDownloadButton({
        url: data.url,
        label: customLabel || `📄 DOWNLOAD ${file.name.toUpperCase()}`,
      });
    } catch (err) {
      alert(`Terjadi kesalahan: ${(err as Error).message}`);
    } finally {
      setUploading(false);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden bg-white shadow-2xs">
      {/* Hidden File Inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
      <input
        ref={pdfInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handlePdfUpload}
      />

      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2.5 py-1.5 rounded-lg border ${
            editor.isActive('bold')
              ? 'bg-[#0b6330] text-white border-[#0b6330]'
              : 'bg-white border-gray-200 hover:bg-gray-100 text-gray-800'
          }`}
        >
          Bold
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2.5 py-1.5 rounded-lg border ${
            editor.isActive('italic')
              ? 'bg-[#0b6330] text-white border-[#0b6330]'
              : 'bg-white border-gray-200 hover:bg-gray-100 text-gray-800'
          }`}
        >
          Italic
        </button>

        <div className="w-[1px] h-5 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2.5 py-1.5 rounded-lg border ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-[#0b6330] text-white border-[#0b6330]'
              : 'bg-white border-gray-200 hover:bg-gray-100 text-gray-800'
          }`}
        >
          H2
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2.5 py-1.5 rounded-lg border ${
            editor.isActive('bulletList')
              ? 'bg-[#0b6330] text-white border-[#0b6330]'
              : 'bg-white border-gray-200 hover:bg-gray-100 text-gray-800'
          }`}
        >
          Bullet List
        </button>

        <div className="w-[1px] h-5 bg-gray-300 mx-1" />

        {/* Sisip Gambar */}
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          disabled={uploading}
          className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-1"
        >
          🖼️ Sisip Gambar
        </button>

        {/* Sisip Tombol PDF Custom */}
        <button
          type="button"
          onClick={() => pdfInputRef.current?.click()}
          disabled={uploading}
          className="px-3 py-1.5 rounded-lg bg-emerald-50 text-[#0b6330] border border-emerald-300 hover:bg-emerald-100 transition-colors flex items-center gap-1 font-bold"
        >
          📄 Insert PDF Button (Hijau)
        </button>

        {uploading && (
          <span className="ml-auto text-amber-600 font-semibold animate-pulse text-xs">
            ⏳ Mengupload file...
          </span>
        )}
      </div>

      {/* Editor Content Box */}
      <div className="p-4 min-h-[320px] max-h-[600px] overflow-y-auto prose max-w-none focus:outline-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
