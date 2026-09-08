"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Partners } from "@/components/landing/Partners";
import { Goals } from "@/components/landing/Goals";
import { Benefits } from "@/components/landing/Benefits";
import { Products } from "@/components/landing/Products";
import { EventsSection } from "@/components/landing/EventsSection";
import { NewsShowcase } from "@/components/news/NewsShowcase";
import { Roadmap } from "@/components/landing/Roadmap";
import { Team } from "@/components/landing/Team";
import { ContactSection } from "@/components/landing/ContactSection";
import { Footer } from "@/components/landing/Footer";
import { ApplicationModal } from "@/components/landing/ApplicationModal";
import { EventSubmissionModal } from "@/components/landing/EventSubmissionModal";
import { PrivacyModal } from "@/components/landing/PrivacyModal";

export default function LandingPage() {
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Hash-based modal triggers (matching ursa-major.ru #popup:myform, #popup:event, #popup:privacy)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#popup:myform") {
        setIsAppModalOpen(true);
      } else if (hash === "#popup:event") {
        setIsEventModalOpen(true);
      } else if (hash === "#popup:privacy" || hash === "#privacy") {
        setIsPrivacyModalOpen(true);
      } else if (hash && !hash.startsWith("#popup:")) {
        const targetId = hash.replace("#", "");
        const elem = document.getElementById(targetId);
        if (elem) {
          setTimeout(() => {
            const headerOffset = 80;
            const elementPosition = elem.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth",
            });
          }, 150);
        }
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const openAppModal = () => {
    setIsAppModalOpen(true);
    window.location.hash = "popup:myform";
  };

  const closeAppModal = () => {
    setIsAppModalOpen(false);
    if (window.location.hash === "#popup:myform") {
      history.replaceState(null, "", window.location.pathname);
    }
  };

  const openEventModal = () => {
    setIsEventModalOpen(true);
    window.location.hash = "popup:event";
  };

  const closeEventModal = () => {
    setIsEventModalOpen(false);
    if (window.location.hash === "#popup:event") {
      history.replaceState(null, "", window.location.pathname);
    }
  };

  const openPrivacyModal = () => {
    setIsPrivacyModalOpen(true);
    window.location.hash = "popup:privacy";
  };

  const closePrivacyModal = () => {
    setIsPrivacyModalOpen(false);
    if (
      window.location.hash === "#popup:privacy" ||
      window.location.hash === "#privacy"
    ) {
      history.replaceState(null, "", window.location.pathname);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-white text-[#111111] overflow-x-hidden selection:bg-[#f8173f] selection:text-white">
      {/* Navigation Header */}
      <Header onOpenApplicationModal={openAppModal} />

      {/* 1. Hero (#up) */}
      <Hero onOpenApplicationModal={openAppModal} />

      {/* 2. Partners (#partners) */}
      <Partners />

      {/* 3. Goals (#goals) */}
      <Goals />

      {/* 4. Benefits (#benefit) */}
      <Benefits onOpenApplicationModal={openAppModal} />

      {/* 5. Products (#product) */}
      <Products onOpenApplicationModal={openAppModal} />

      {/* 6. Events Showcase (#events) */}
      <EventsSection onOpenEventModal={openEventModal} />

      {/* 7. News Showcase (#news) */}
      <NewsShowcase />

      {/* 8. Roadmap (#roadmap) */}
      <Roadmap />

      {/* 8. Board of Directors / Team (#team) */}
      <Team onOpenApplicationModal={openAppModal} />

      {/* 9. Contact Form (#form) */}
      <ContactSection onOpenPrivacy={openPrivacyModal} />

      {/* 10. Footer */}
      <Footer onOpenPrivacy={openPrivacyModal} />

      {/* Modals */}
      <ApplicationModal
        isOpen={isAppModalOpen}
        onClose={closeAppModal}
        onOpenPrivacy={() => {
          closeAppModal();
          openPrivacyModal();
        }}
      />

      <EventSubmissionModal
        isOpen={isEventModalOpen}
        onClose={closeEventModal}
        onOpenPrivacy={() => {
          closeEventModal();
          openPrivacyModal();
        }}
      />

      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={closePrivacyModal}
      />
    </main>
  );
}
