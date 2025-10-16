/**
 * I18n System - Hệ thống đa ngôn ngữ
 */
class I18n {
    constructor() {
        this.currentLang = 'vi';
        this.translations = {};
    }

    async loadLanguage(lang) {
        try {
            const response = await fetch(`/src/data/${lang}.json`);
            this.translations[lang] = await response.json();
            this.currentLang = lang;
        } catch (error) {
            console.error(`Failed to load language: ${lang}`, error);
        }
    }

    t(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];
        
        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                return key;
            }
        }
        
        return value || key;
    }
}

export default new I18n();
