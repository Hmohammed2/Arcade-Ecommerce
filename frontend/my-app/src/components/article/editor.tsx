"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
});

interface ArticleEditorProps {
  content: string;
  onChange: (value: string) => void;

  // NEW:
  thumbnailUrl?: string | null;
  onThumbnailChange: (file: File | null) => void;
}

export default function ArticleEditor({
  content,
  onChange,
  thumbnailUrl,
  onThumbnailChange,
}: ArticleEditorProps) {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <div data-color-mode="light" className="space-y-6">
      {/* Thumbnail uploader */}
      <div className="rounded-lg border p-4 space-y-3">
        <p className="text-sm font-medium">Thumbnail Cover</p>

        {(preview || thumbnailUrl) && (
          <div className="relative h-40 w-full rounded-md overflow-hidden">
            <Image
              src={preview ?? thumbnailUrl ?? ""}
              alt="Video thumbnail preview"
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover"
            />
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setPreview(file ? URL.createObjectURL(file) : null);
            onThumbnailChange(file);
          }}
          className="block w-full text-sm"
        />
      </div>

      {/* Markdown Editor */}
      <MDEditor
        value={content}
        onChange={(val) => onChange(val || "")}
        height={500}
      />
    </div>
  );
}
