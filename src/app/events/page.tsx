import { Suspense } from "react";
import { Metadata } from "next";
import EventsCatalogClient from "./EventsCatalogClient";

export const metadata: Metadata = {
  title: "Мероприятия и питч-дни | Ассоциация «Большая Медведица»",
  description:
    "Каталог инвестиционных мероприятий, питч-сессий, конференций и закрытых встреч резидентов ассоциации «Большая Медведица».",
  openGraph: {
    title: "Мероприятия и события | Ассоциация «Большая Медведица»",
    description:
      "Инвестиционные питч-сессии, закрытые встречи бизнес-ангелов и венчурные конференции участников ассоциации «Большая Медведица».",
    url: "https://ursa-major.ru/events",
    siteName: "Большая Медведица",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Мероприятия и питч-дни | Ассоциация «Большая Медведица»",
    description:
      "Каталог инвестиционных мероприятий, питч-сессий и закрытых встреч резидентов ассоциации.",
  },
};

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fbfbf9]">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-3 border-[#f8173f] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-500 font-medium">Загрузка каталога мероприятий...</p>
          </div>
        </div>
      }
    >
      <EventsCatalogClient />
    </Suspense>
  );
}
