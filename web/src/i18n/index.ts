import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import zhCN from './zh-CN.json'
import en from './en.json'

const savedLanguage = window.localStorage.getItem('lang') ?? 'en'

i18n.use(initReactI18next).init({
  lng: savedLanguage,
  fallbackLng: 'en',
  resources: {
    'zh-CN': { translation: zhCN },
    en: { translation: en },
  },
  interpolation: { escapeValue: false },
})

export default i18n
