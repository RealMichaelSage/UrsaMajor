"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface HeaderProps {
  onOpenApplicationModal?: () => void;
}

export function Header({ onOpenApplicationModal }: HeaderProps = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleOpenAppModal = () => {
    if (onOpenApplicationModal) {
      onOpenApplicationModal();
    } else {
      window.location.href = "/#popup:myform";
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileMenuOpen]);

  const aboutSubmenu = [
    { title: "Цели", href: "/#goals" },
    { title: "Планы", href: "/#roadmap" },
    { title: "Совместные продукты", href: "/#product" },
    { title: "Резиденты", href: "/#partners" },
    { title: "Преимущества", href: "/#benefit" },
    { title: "Правление", href: "/#team" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 bg-white/95 backdrop-blur-md ${
        scrolled ? "shadow-sm border-b border-gray-200 py-3" : "py-4 sm:py-5 border-b border-gray-100"
      }`}
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo & Emblem */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
            <Image
              src="/assets/ursa-emblem.svg"
              alt="Большая Медведица"
              fill
              priority
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs tracking-[0.2em] font-medium text-gray-500 uppercase">
              Ассоциация
            </span>
            <span className="text-base sm:text-lg font-bold tracking-tight text-[#111111] group-hover:text-[#f8173f] transition-colors uppercase">
              Большая Медведица
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-7 text-sm font-medium text-[#111111]">
          <Link
            href="/"
            className="py-2 hover:text-[#f8173f] transition-colors"
          >
            Главная
          </Link>
          {/* Dropdown "О нас" */}
          <div
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setDropdownOpen((prev) => !prev);
                }
                if (e.key === "Escape") setDropdownOpen(false);
              }}
              className="flex items-center space-x-1 py-2 hover:text-[#f8173f] transition-colors focus:outline-none cursor-pointer"
            >
              <span>О нас</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180 text-[#f8173f]" : "text-gray-400"
                }`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 w-56 bg-white border border-gray-200 shadow-xl py-2 z-50 animate-scale-up">
                {aboutSubmenu.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-[#333333] hover:bg-[#fbfbf9] hover:text-[#f8173f] transition-colors"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/events"
            className="py-2 hover:text-[#f8173f] transition-colors"
          >
            Мероприятия
          </Link>

          <Link
            href="/news"
            className="py-2 hover:text-[#f8173f] transition-colors"
          >
            Новости
          </Link>

          <button
            type="button"
            onClick={handleOpenAppModal}
            className="py-2 hover:text-[#f8173f] transition-colors cursor-pointer"
          >
            Вступление
          </button>
        </nav>

        {/* Action Button & Burger Toggle */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenAppModal}
            className="hidden sm:inline-flex"
          >
            Написать нам
          </Button>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:text-[#111111] hover:bg-gray-100 rounded focus:outline-none cursor-pointer"
            aria-label="Меню"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-[#111111]" />
            ) : (
              <Menu className="w-6 h-6 text-[#111111]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[60px] z-50 bg-white flex flex-col p-6 overflow-y-auto lg:hidden animate-fade-in border-t border-gray-200">
          <div className="flex flex-col space-y-4 pb-8">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-bold text-[#111111] hover:text-[#f8173f] pb-2 border-b border-gray-100"
            >
              Главная
            </Link>
            <div className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-1">
              О нас
            </div>
            {aboutSubmenu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium text-[#111111] hover:text-[#f8173f] transition-colors pl-2 py-1 border-l-2 border-transparent hover:border-[#f8173f]"
              >
                {item.title}
              </Link>
            ))}

            <div className="pt-4 border-t border-gray-100 space-y-4">
              <Link
                href="/events"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-lg font-medium text-[#111111] hover:text-[#f8173f]"
              >
                Мероприятия
              </Link>
              <Link
                href="/news"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-lg font-medium text-[#111111] hover:text-[#f8173f]"
              >
                Новости
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleOpenAppModal();
                }}
                className="block text-left text-lg font-medium text-[#111111] hover:text-[#f8173f] cursor-pointer"
              >
                Вступление
              </button>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-gray-200">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => {
                setMobileMenuOpen(false);
                handleOpenAppModal();
              }}
            >
              Написать нам
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
