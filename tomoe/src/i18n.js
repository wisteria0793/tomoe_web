import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 各言語の翻訳ファイルをインポート
import translationEN from './locales/en.json';
import translationJA from './locales/ja.json';

const resources = {
  en: {
    translation: translationEN
  },
  ja: {
    translation: translationJA
  }
};

i18n
  .use(LanguageDetector)  // 言語検出を追加
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ja',  // フォールバック言語
    lng: localStorage.getItem('i18nextLng') || 'ja', // ローカルストレージから言語設定を取得
    debug: true,
    interpolation: {
      escapeValue: false
    },
    detection: {  // 言語検出の設定
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    }
  });

// 言語変更時にローカルストレージに保存
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
});

export default i18n; 