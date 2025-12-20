"use client";

import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
});

interface ArticleEditorProps {
  content: string;
  onChange: (value: string) => void;
}

export default function ArticleEditor({
  content,
  onChange,
}: ArticleEditorProps) {
  return (
    <div data-color-mode="light">
      <MDEditor
        value={content}
        onChange={(val) => onChange(val || "")}
        height={500}
      />
    </div>
  );
}
