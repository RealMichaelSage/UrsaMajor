"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "lg",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-xl",
    xl: "max-w-2xl",
    "2xl": "max-w-3xl",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-white border border-gray-200 shadow-2xl p-6 sm:p-8 my-8 text-[#111111] animate-scale-up`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-[#111111] hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        {(title || subtitle) && (
          <div className="mb-6 pr-8">
            {title && (
              <h3 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight mb-2">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm sm:text-base text-[#666666] font-light leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Content */}
        <div className="text-[#333333]">{children}</div>
      </div>
    </div>
  );
}
