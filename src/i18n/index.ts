import { initReactI18next } from "react-i18next";

import * as Localization from "expo-localization";
import i18n from "i18next";
import en from "./locales/en.json";
import ko from "./locales/ko.json";

const resources = { en, ko };

const languageDetector = {
    type: "languageDetector",
    async: true, // async detection
    detect: cb => {
        return Localization.getLocalizationAsync().then(({ locale }) => {
            cb(locale);
        });
    },
    init: () => {},
    cacheUserLanguage: () => {}
};

i18n.use(initReactI18next)
    .use(languageDetector)
    .init({
        resources,
        lng: Localization.locale,
        fallbackLng: "en",
        keySeparator: false, // we do not use keys in form messages.welcome
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
