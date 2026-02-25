"use client";

import { useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll("article h2, article h3"),
    ) as HTMLElement[];

    const mapped = elements.map((el) => ({
      id: el.id,
      text: el.innerText,
      level: el.tagName === "H2" ? 2 : 3,
    }));

    setHeadings(mapped);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-40% 0px -55% 0px",
      },
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  if (!headings.length) return null;

  const List = (
    <ul className="space-y-1 border-l border-gray-200 dark:border-gray-700 pl-4">
      {headings.map((h) => {
        const isActive = activeId === h.id;

        return (
          <li key={h.id} className={h.level === 3 ? "ml-3" : ""}>
            <a
              href={`#${h.id}`}
              onClick={() => setOpen(false)}
              className={`
                relative block py-1 transition-colors
                ${
                  isActive
                    ? "text-pink-600 dark:text-pink-400 font-medium before:absolute before:left-[-1rem] before:top-0 before:h-full before:w-[3px] before:bg-pink-500"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }
              `}
            >
              {h.text}
            </a>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Desktop Sidebar TOC */}
      <nav aria-label="Table of contents" className="hidden lg:block text-sm">
        <p className="mb-4 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
          On this page
        </p>
        {List}
      </nav>

      {/* Mobile Floating Button */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-24 right-4 z-40 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 text-xs font-medium shadow"
      >
        Sections
      </button>

      {/* Mobile Drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40">
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl p-6 max-h-[70vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-semibold">On this page</p>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            {List}
          </div>
        </div>
      )}
    </>
  );
}
