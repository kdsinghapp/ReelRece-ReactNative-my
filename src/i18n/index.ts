import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./localization/en.json";

const resources = {
  en: { translation: en },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",            // default
    fallbackLng: "en",
    interpolation: { escapeValue: false },

     returnNull: false,
    returnEmptyString: false,

    // Optional: logs missing keys in dev
    saveMissing: __DEV__,
    missingKeyHandler: __DEV__
      ? (_lng, _ns, key) => console.log("[i18n missing key]", key)
      : undefined,
  });

export default i18n;
