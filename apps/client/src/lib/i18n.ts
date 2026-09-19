import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import uzCommon from "../locales/uz/common.json";
import uzAuth from "../locales/uz/auth.json";
import uzLanding from "../locales/uz/landing.json";
import uzStudent from "../locales/uz/student.json";
import uzAssignments from "../locales/uz/assignments.json";
import uzTwin from "../locales/uz/twin.json";
import uzSettings from "../locales/uz/settings.json";
import uzInterview from "../locales/uz/interview.json";

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
      student: uzStudent,
      assignments: uzAssignments,
      twin: uzTwin,
      settings: uzSettings,
      interview: uzInterview,
    },
  },
  lng: "uz",
  fallbackLng: "uz",
  defaultNS: "common",
  interpolation: { escapeValue: false },
});

export default i18n;
