"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export interface EventSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPrivacy?: () => void;
}

export function EventSubmissionModal({
  isOpen,
  onClose,
  onOpenPrivacy,
}: EventSubmissionModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    geo: "",
    website: "",
    company: "",
    name: "",
    telegram: "",
    phone: "",
    email: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      title: "",
      description: "",
      eventDate: "",
      geo: "",
      website: "",
      company: "",
      name: "",
      telegram: "",
      phone: "",
      email: "",
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title={
        submitted
          ? "Мероприятие отправлено!"
          : "Разместить мероприятие"
      }
      subtitle={
        submitted
          ? "Мероприятие поступило в очередь модерации. Координатор свяжется с вами после проверки."
          : "Мы с удовольствием разместим события каждого резидента ассоциации «Большая Медведица»."
      }
      maxWidth="xl"
    >
      {submitted ? (
        <div className="py-6 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-[#f8173f]">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <p className="text-gray-600 max-w-md">
            Спасибо за подачу события! После модерации оно появится в расписании мероприятий ассоциации «Большая Медведица» и попадет в рассылку резидентам.
          </p>
          <Button variant="primary" size="md" onClick={handleReset}>
            Закрыть
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Название мероприятия <span className="text-[#f8173f]">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="Например: Питч-сессия стартапов ранних стадий"
              className="w-full px-3.5 py-2.5 bg-[#fbfbf9] border border-gray-300 focus:border-[#f8173f] focus:bg-white text-sm outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Описание мероприятия <span className="text-[#f8173f]">*</span>
            </label>
            <textarea
              name="description"
              required
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Кратко о программе, спикерах и формате..."
              className="w-full px-3.5 py-2.5 bg-[#fbfbf9] border border-gray-300 focus:border-[#f8173f] focus:bg-white text-sm outline-none transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Дата мероприятия <span className="text-[#f8173f]">*</span>
              </label>
              <input
                type="text"
                name="eventDate"
                required
                value={formData.eventDate}
                onChange={handleChange}
                placeholder="07-02-2026 или 15 марта 2026, 18:00"
                className="w-full px-3.5 py-2.5 bg-[#fbfbf9] border border-gray-300 focus:border-[#f8173f] focus:bg-white text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Место проведения / Адрес <span className="text-[#f8173f]">*</span>
              </label>
              <input
                type="text"
                name="geo"
                required
                value={formData.geo}
                onChange={handleChange}
                placeholder="Москва / Онлайн (Zoom) / Таиланд"
                className="w-full px-3.5 py-2.5 bg-[#fbfbf9] border border-gray-300 focus:border-[#f8173f] focus:bg-white text-sm outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Ссылка на сайт мероприятия (если есть)
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://event.example.com"
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
                placeholder="Клуб / Фонд / Организатор"
                className="w-full px-3.5 py-2.5 bg-[#fbfbf9] border border-gray-300 focus:border-[#f8173f] focus:bg-white text-sm outline-none transition-colors"
              />
            </div>
          </div>

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
                placeholder="Иван Иванов"
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
          </div>

          <div className="pt-2">
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Нажимая на кнопку &apos;Отправить&apos;, вы соглашаетесь с нашей{" "}
              <button
                type="button"
                onClick={() => {
                  if (onOpenPrivacy) onOpenPrivacy();
                }}
                className="text-[#f8173f] underline hover:text-[#dc1235]"
              >
                политикой конфиденциальности
              </button>
              .
            </p>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
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
