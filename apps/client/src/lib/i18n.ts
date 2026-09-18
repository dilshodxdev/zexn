import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import uzCommon from "../locales/uz/common.json";
import uzAuth from "../locales/uz/auth.json";
import uzLanding from "../locales/uz/landing.json";

/**
 * i18next: uz asosiy, ru keyin qo'shiladi.
 * UI matnlari faqat shu JSON'larda - komponent ichida qattiq yozilgan matn bo'lmasin.
 */
void i18n.use(initReactI18next).init({
  resources: {
    uz: {
      common: uzCommon,
      auth: uzAuth,
      landing: uzLanding,
    },
  },
  lng: "uz",
  fallbackLng: "uz",
  defaultNS: "common",
  interpolation: { escapeValue: false },
});

export default i18n;
