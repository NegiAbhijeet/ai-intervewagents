import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNLocalize from 'react-native-localize';

import en from '../locales/en.json';
import es from '../locales/es.json';
import hi from '../locales/hi.json';

const resources = { en: { translation: en }, es: { translation: es }, hi: { translation: hi } };

i18n.use(initReactI18next).init({
    resources,
    fallbackLng: 'en',
    compatibilityJSON: 'v3',
    interpolation: { escapeValue: false }
});

export async function loadSavedLanguage() {
    try {
        const saved = await AsyncStorage.getItem('user-language');
        if (saved) {
            await i18n.changeLanguage(saved);
            return saved;
        }
        // fallback: try device locale
        const best = RNLocalize.findBestAvailableLanguage(Object.keys(resources));
        const lang = (best && best.languageTag) || 'en';
        await i18n.changeLanguage(lang);
        return lang;
    } catch (e) {
        await i18n.changeLanguage('en');
        return 'en';
    }
}

export async function setAppLanguage(lng) {
    try {
        await AsyncStorage.setItem('user-language', lng);
        await i18n.changeLanguage(lng);
        return true;
    } catch (e) {
        return false;
    }
}

export default i18n;
