import { languages, type CodeName } from './types/locale';


export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',

    css: ['~/assets/styles/root.scss'],

    runtimeConfig: {
        apiKeyPastebin: process.env.PASTEBIN_API_KEY,
        apiKeyImgDB: process.env.IMGDB_API_KEY
    },

    modules: [
        '@nuxtjs/supabase',
        '@pinia/nuxt',
        '@nuxtjs/i18n'
    ],

    vite: {
        optimizeDeps: {
            include: ['@supabase/supabase-js']
        }
    },

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