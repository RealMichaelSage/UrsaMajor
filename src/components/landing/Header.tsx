"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UrsaEmblem } from "./UrsaEmblem";

export interface HeaderProps {
  onOpenApplicationModal?: () => void;
}

export function Header({ onOpenApplicationModal }: HeaderProps = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

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

  const handleAnchorNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const hashIndex = href.indexOf("#");
    if (hashIndex === -1) return;
    const targetId = href.substring(hashIndex + 1);

    setDropdownOpen(false);
    setMobileMenuOpen(false);

    const currentPath = typeof window !== "undefined" ? window.location.pathname.replace(/\/$/, "") : "";
    const isHome =
      currentPath === "" ||
      currentPath === "/ursa" ||
      currentPath === "/ursa/index.html" ||
      currentPath === "/";

    if (isHome) {
      e.preventDefault();
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
        window.history.pushState(null, "", `${window.location.pathname}#${targetId}`);
      }
    } else {
      e.preventDefault();
      window.location.href = `/ursa/#${targetId}`;
    }
  };

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const currentPath = typeof window !== "undefined" ? window.location.pathname.replace(/\/$/, "") : "";
    const isHome =
      currentPath === "" ||
      currentPath === "/ursa" ||
      currentPath === "/ursa/index.html" ||
      currentPath === "/";

    if (isHome) {
      e.preventDefault();
      setDropdownOpen(false);
      setMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.pushState(null, "", window.location.pathname);
    }
  };

  const aboutSubmenu = [
    { title: "Цели", href: "/#goals" },
    { title: "Планы", href: "/#roadmap" },
    { title: "Совместные продукты", href: "/#product" },
    { title: "Резиденты", href: "/#partners" },
    { title: "Преимущества", href: "/#benefit" },
    { title: "Правление", href: "/#team" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          mobileMenuOpen
            ? "bg-white border-b border-gray-200"
            : scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200"
            : "bg-white/95 backdrop-blur-md border-b border-gray-100"
        } h-16 sm:h-20 flex items-center`}
      >
      <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo &&nbsp;Emblem */}
        <Link href="/" onClick={handleHomeClick} className="flex items-center space-x-3 group">
          <UrsaEmblem className="w-8 h-8 sm:w-10 sm:h-10 text-[#010207] group-hover:text-[#f8173f] transition-colors flex-shrink-0" />
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
            onClick={handleHomeClick}
            className="py-2 hover:text-[#f8173f] transition-colors"
          >
            Главная
          </Link>
          {/* Dropdown "О нас" */}
          <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button
              type="button"
              onClick={() => setDropdownOpen(true)}
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
              <span>О&nbsp;нас</span>
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
                    onClick={(e) => handleAnchorNavigation(e, item.href)}
                    className="block px-4 py-2 text-sm text-[#333333] hover:bg-[#fbfbf9] hover:text-[#f8173f] transition-colors cursor-pointer"
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

        {/* Action Button &&nbsp;Burger Toggle */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="hidden sm:block">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenAppModal}
            >
              Написать нам
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-2.5 text-gray-700 hover:text-[#111111] hover:bg-gray-100 rounded focus:outline-none cursor-pointer flex items-center justify-center min-w-[44px] min-h-[44px]"
            aria-label="Меню"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-[#111111]" />
            ) : (
              <Menu className="w-6 h-6 text-[#111111]" />
            )}
          </button>
        </div>
      </div>
    </header>

    {/* Mobile Menu Drawer (Sibling to Header to avoid backdrop-filter stacking context containment) */}
    {mobileMenuOpen && (
      <div
        className="fixed inset-x-0 top-16 bottom-0 z-40 bg-white flex flex-col p-6 overflow-y-auto lg:hidden animate-fade-in"
        style={{ height: "calc(100dvh - 64px)" }}
      >
        <div className="flex flex-col space-y-4 pb-8 flex-1">
          <Link
            href="/"
            onClick={handleHomeClick}
            className="text-lg font-bold text-[#111111] hover:text-[#f8173f] pb-2 border-b border-gray-100"
          >
            Главная
          </Link>
          <div className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-1">
            О&nbsp;нас
          </div>
          {aboutSubmenu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => handleAnchorNavigation(e, item.href)}
              className="text-lg font-medium text-[#111111] hover:text-[#f8173f] transition-colors pl-2 py-1 border-l-2 border-transparent hover:border-[#f8173f] cursor-pointer"
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

        <div className="mt-auto pt-6 border-t border-gray-200 space-y-3">
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
          <div className="text-center text-xs text-gray-400">
            ©&nbsp;АПУВИР «Большая Медведица»,&nbsp;2026
          </div>
        </div>
      </div>
    )}
  </>
);
}
