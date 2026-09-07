"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPrivacy?: () => void;
}

export function ApplicationModal({
  isOpen,
  onClose,
  onOpenPrivacy,
}: ApplicationModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    telegram: "",
    position: "",
    company: "",
    website: "",
    recommendation: "",
    request: "",
    consentAgreed: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, consentAgreed: e.target.checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Maintain real state
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      name: "",
      phone: "",
      email: "",
      telegram: "",
      position: "",
      company: "",
      website: "",
      recommendation: "",
      request: "",
      consentAgreed: false,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title={submitted ? "Заявка отправлена!" : "Мы рады новым резидентам!"}
      subtitle={
        submitted
          ? "Спасибо! Мы получили вашу заявку и свяжемся с вами в течение рабочего дня."
          : "Заполните форму и мы с удовольствием с вами свяжемся)"
      }
      maxWidth="xl"
    >
      {submitted ? (
        <div className="py-6 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-[#f8173f]">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <p className="text-gray-600 max-w-md">
            Ваш запрос передан координатору ассоциации «Большая Медведица». В ближайшее время мы свяжемся с вами в Telegram или по телефону.
          </p>
          <Button variant="primary" size="md" onClick={handleReset}>
            Закрыть
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                ФИО <span className="text-[#f8173f]">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Иванов Иван Иванович"
                className="w-full px-3.5 py-2.5 bg-[#fbfbf9] border border-gray-300 focus:border-[#f8173f] focus:bg-white text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Телефон <span className="text-[#f8173f]">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="+7 (999) 000-00-00"
                className="w-full px-3.5 py-2.5 bg-[#fbfbf9] border border-gray-300 focus:border-[#f8173f] focus:bg-white text-sm outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                E-mail <span className="text-[#f8173f]">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="example@mail.ru"
                className="w-full px-3.5 py-2.5 bg-[#fbfbf9] border border-gray-300 focus:border-[#f8173f] focus:bg-white text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Ник в Telegram <span className="text-[#f8173f]">*</span>
              </label>
              <input
                type="text"
                name="telegram"
                required
                value={formData.telegram}
                onChange={handleChange}
                placeholder="@username"
                className="w-full px-3.5 py-2.5 bg-[#fbfbf9] border border-gray-300 focus:border-[#f8173f] focus:bg-white text-sm outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Должность <span className="text-[#f8173f]">*</span>
              </label>
              <input
                type="text"
                name="position"
                required
                value={formData.position}
                onChange={handleChange}
                placeholder="Основатель / Инвестиционный директор"
                className="w-full px-3.5 py-2.5 bg-[#fbfbf9] border border-gray-300 focus:border-[#f8173f] focus:bg-white text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Компания <span className="text-[#f8173f]">*</span>
              </label>
              <input
                type="text"
                name="company"
                required
                value={formData.company}
                onChange={handleChange}
                placeholder="Название клуба или компании"
                className="w-full px-3.5 py-2.5 bg-[#fbfbf9] border border-gray-300 focus:border-[#f8173f] focus:bg-white text-sm outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Сайт (если есть)
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.ru"
                className="w-full px-3.5 py-2.5 bg-[#fbfbf9] border border-gray-300 focus:border-[#f8173f] focus:bg-white text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Кто может вас порекомендовать?
              </label>
              <input
                type="text"
                name="recommendation"
                value={formData.recommendation}
                onChange={handleChange}
                placeholder="Член правления / резидент ассоциации"
                className="w-full px-3.5 py-2.5 bg-[#fbfbf9] border border-gray-300 focus:border-[#f8173f] focus:bg-white text-sm outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Запрос или вопрос (если есть)
            </label>
            <textarea
              name="request"
              rows={3}
              value={formData.request}
              onChange={handleChange}
              placeholder="Расскажите о ваших целях или проектах..."
              className="w-full px-3.5 py-2.5 bg-[#fbfbf9] border border-gray-300 focus:border-[#f8173f] focus:bg-white text-sm outline-none transition-colors resize-none"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-start space-x-3 text-xs text-gray-600 mb-4 leading-relaxed cursor-pointer select-none">
              <input
                type="checkbox"
                name="consentAgreed"
                required
                checked={formData.consentAgreed}
                onChange={handleCheckboxChange}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#f8173f] focus:ring-[#f8173f] accent-[#f8173f]"
              />
              <span>
                Я согласен с{" "}
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenPrivacy) onOpenPrivacy();
                  }}
                  className="text-[#f8173f] underline hover:text-[#dc1235]"
                >
                  политикой конфиденциальности
                </button>{" "}
                и даю согласие на обработку персональных данных (152-ФЗ).
              </span>
            </label>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={!formData.consentAgreed}
              className="w-full uppercase tracking-wider font-semibold"
            >
              Отправить
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
