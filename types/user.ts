export type ProviderName = 'github' | 'google';

export interface User {
    id: number;
    uid: string;
    user: {
        iss: string;
        sub: string | number;
        name: string;
        email: string;
        full_name: string;
        providers: Array<ProviderName>;
        user_name: string;
        avatar_url: string;
        provider_id: string | number;
        email_verified: boolean;
        phone_verified: boolean;
        preferred_username: string;
    };
    created_at: string;
}


export interface Provider {
    name: string;
    logoUrl: string;
}

export const providers: Record<ProviderName, Provider> = {
    'github': {
        name: 'GitHub',
        logoUrl: 'https://github.githubassets.com/favicons/favicon-dark.png'
    },
    'google': {
        name: 'Google',
        logoUrl: 'https://www.gstatic.com/images/branding/searchlogo/ico/favicon.ico'
    }
};