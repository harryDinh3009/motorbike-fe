import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import VI from "@/locales/vi/module.json";
import KO from "@/locales/ko/module.json";
import EN from "@/locales/en/module.json";

type MessageSchema = typeof VI;

i18n.use(initReactI18next).init({
  resources: {
    vi: {
      translation: VI,
    },
    ko: {
      translation: KO,
    },
    en: {
      translation: EN,
    },
  },
  lng: "vi",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
