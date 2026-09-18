import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import uzCommon from "../locales/uz/common.json";

/**
 * i18next: uz asosiy, ru keyin qo'shiladi (locales/ru/common.json + resources.ru).
 * UI matnlari faqat shu JSON'larda - komponent ichida qattiq yozilgan matn bo'lmasin.
 */
void i18n.use(initReactI18next).init({
  resources: {
    uz: { common: uzCommon },
  },
  lng: "uz",
  fallbackLng: "uz",
  defaultNS: "common",
  interpolation: { escapeValue: false }, // React o'zi escape qiladi
});

export default i18n;
