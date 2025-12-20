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
      document.querySelectorAll("h2, h3")
    ) as HTMLElement[];

    const items = elements.map((el) => ({
      id: el.id,
      text: el.innerText,
      level: el.tagName === "H2" ? 2 : 3,
    }));

    setHeadings(items);
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav className="text-sm">
      <p className="mb-3 font-semibold">On this page</p>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li key={heading.id} className={heading.level === 3 ? "ml-4" : ""}>
            <a
              href={`#${heading.id}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
