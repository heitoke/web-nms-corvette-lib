import { createError } from 'h3';
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const $user = await serverSupabaseUser(event);
    const client = await serverSupabaseClient<any>(event);

    const { private: privateMode, name, description, data: corvetteData } = await readBody(event) as { private?: boolean, name: string, description?: string, data: object };

    // const apiKeyPastebin = useRuntimeConfig()?.apiKeyPastebin;

    // const res = await fetch('https://pastebin.com/api/api_post.php', {
    //     headers: {
    //         'Content-Type': 'application/x-www-form-urlencoded'
    //     },
    //     body: `api_dev_key=${apiKeyPastebin}&api_results_limit=1000&api_paste_code=${encodeURIComponent(JSON.stringify(corvetteData))}&api_option=paste&api_paste_format=json&api_paste_private=1`,
    //     method: 'POST'
    // });

    // const urlData = await res.text();

    // console.log(urlData)

    // if (!/https|pastebin\.com/.test(urlData)) {
    //     throw createError({ statusMessage: 'error' });
    // }

    const { data, error } = await client.from('corvettes')
        .upsert({
            private: privateMode,
            user_id: $user?.app_metadata?.public_id,
            name,
            description,
            data: corvetteData// urlData.split('/').pop()
        })
        .select('id, name, description, created_at')
        .single();

    if (error) {
        throw createError({ statusMessage: error.message });
    }

    return data;
});