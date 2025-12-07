"use client";

import { useState } from "react";
import Image from "next/image";

interface ZoomModalProps {
  src: string;
  alt: string;
  trigger?: (open: () => void) => React.ReactNode;
}

export function ZoomModal({ src, alt, trigger }: ZoomModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  if (trigger) return trigger(open);

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="relative w-full h-full cursor-zoom-in"
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="100vw"
        />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4"
          onClick={close}
        >
          <div className="relative w-full max-w-5xl h-auto">
            <Image
              src={src}
              alt={alt}
              width={1600}
              height={1200}
              className="object-contain w-full h-auto max-h-[90vh] rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
}
