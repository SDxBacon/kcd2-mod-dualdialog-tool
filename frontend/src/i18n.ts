import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ZH_TW from "./locales/zh-tw.json";
import ZH_CN from "./locales/zh-cn.json";
import EN from "./locales/en.json";
import JA from "./locales/ja.json";
import KR from "./locales/kr.json";

export const UILanguage = {
  EN: "en",
  ZH_TW: "zh_tw",
  ZH_CN: "zh_cn",
  JA: "ja",
  KR: "kr",
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources: {
      [UILanguage.EN]: {
        translation: EN,
      },
      [UILanguage.ZH_TW]: {
        translation: ZH_TW,
      },
      [UILanguage.ZH_CN]: {
        translation: ZH_CN,
      },
      [UILanguage.JA]: {
        translation: JA,
      },
      [UILanguage.KR]: {
        translation: KR,
      },
    },
    lng: UILanguage.EN, // if you're using a language detector, do not define the lng option
    fallbackLng: UILanguage.EN,
    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  });

export default i18n;
