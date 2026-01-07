"use client";

import { useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll("article h2, article h3")
    ) as HTMLElement[];

    setHeadings(
      elements.map((el) => ({
        id: el.id,
        text: el.innerText,
        level: el.tagName === "H2" ? 2 : 3,
      }))
    );
  }, []);

  if (!headings.length) return null;

  return (
    <nav aria-label="Table of contents" className="text-sm">
      <p className="mb-3 font-semibold">On this page</p>
      <ul className="space-y-2">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "ml-4" : ""}>
            <a
              href={`#${h.id}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
