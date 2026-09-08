"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Mail, Send, PhoneCall } from "lucide-react";

export interface ContactSectionProps {
  onOpenPrivacy: () => void;
}

export function ContactSection({ onOpenPrivacy }: ContactSectionProps) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    telegram: "",
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
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      name: "",
      phone: "",
      email: "",
      telegram: "",
      request: "",
      consentAgreed: false,
    });
  };

  return (
    <section id="form" className="scroll-mt-20 sm:scroll-mt-24 py-20 sm:py-28 bg-white border-t border-gray-100">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Heading & Information */}
          <div className="lg:col-span-5 max-w-xl">
            <div className="w-12 h-1 bg-[#f8173f] mb-6" />
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#111111] tracking-tight uppercase mb-4">
              Для связи
            </h2>
            <p className="text-base sm:text-lg font-light text-gray-600 leading-relaxed mb-8">
              Хотите записаться на консультацию? Или просто хотите задать вопрос? В любом случае пишите свой запрос в форме ниже, и мы с вами свяжемся!
            </p>

            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-3 text-sm text-gray-700">
                <Send className="w-4 h-4 text-[#f8173f]" />
                <span>Официальный канал в Telegram: <a href="https://t.me/ursa_major_rf" target="_blank" rel="noopener noreferrer" className="text-[#f8173f] underline">@ursa_major_rf</a></span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-700">
                <Mail className="w-4 h-4 text-[#f8173f]" />
                <span>Почта: info@ursa-major.ru</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-700">
                <PhoneCall className="w-4 h-4 text-[#f8173f]" />
                <span>Координация резидентов: Москва / Санкт-Петербург</span>
              </div>
            </div>
          </div>

          {/* Right Column: 5-Field Form */}
          <div className="lg:col-span-7">
            <div className="bg-[#fbfbf9] border border-gray-200 p-6 sm:p-8 lg:p-10 shadow-sm">
              {submitted ? (
                <div className="py-12 flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-[#f8173f]">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#111111]">
                    Спасибо за обращение!
                  </h3>
                  <p className="text-gray-600 max-w-md text-sm sm:text-base">
                    Ваш запрос успешно отправлен. Ответственный координатор свяжется с вами в течение рабочего дня.
                  </p>
                  <Button variant="outline" size="md" onClick={handleReset}>
                    Отправить еще один запрос
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
                        className="w-full px-4 py-3 bg-white border border-gray-300 focus:border-[#f8173f] text-sm outline-none transition-colors"
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
                        className="w-full px-4 py-3 bg-white border border-gray-300 focus:border-[#f8173f] text-sm outline-none transition-colors"
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
                        className="w-full px-4 py-3 bg-white border border-gray-300 focus:border-[#f8173f] text-sm outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                        Ник в Телеграм <span className="text-[#f8173f]">*</span>
                      </label>
                      <input
                        type="text"
                        name="telegram"
                        required
                        value={formData.telegram}
                        onChange={handleChange}
                        placeholder="@username"
                        className="w-full px-4 py-3 bg-white border border-gray-300 focus:border-[#f8173f] text-sm outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Напишите ваш запрос или вопрос <span className="text-[#f8173f]">*</span>
                    </label>
                    <textarea
                      name="request"
                      required
                      rows={3}
                      value={formData.request}
                      onChange={handleChange}
                      placeholder="Опишите ваш интерес к ассоциации или вопрос..."
                      className="w-full px-4 py-3 bg-white border border-gray-300 focus:border-[#f8173f] text-sm outline-none transition-colors resize-none"
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
                          onClick={onOpenPrivacy}
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
