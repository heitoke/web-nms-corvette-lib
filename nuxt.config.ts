import wasm from 'vite-plugin-wasm';

import { languages, type CodeName } from './types/locale';


export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    runtimeConfig: {},

    css: ['~/assets/styles/root.scss'],
    
    vite: {
        plugins: [
            wasm()
        ]
    },

    modules: [
        '@pinia/nuxt',
        '@nuxtjs/i18n',
        '@nuxtjs/supabase'
    ],

    components: [
        {
            path: '~/components/ui',
            pathPrefix: false,
            prefix: 'UI'
        }
    ],

    pinia: {
        storesDirs: ['./stores/**']
    },
    supabase: {
        redirect: false
    },
    i18n: {
        strategy: 'no_prefix',
        defaultLocale: 'en',
        locales: Object.keys(languages).map((code) => {
            return {
                code,
                name: languages[code as CodeName].name,
                file: code + '.json'
            }
        })
    },

    devtools: { enabled: true },
});