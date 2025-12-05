import { createError } from 'h3';
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const $user = await serverSupabaseUser(event);
    const client = await serverSupabaseClient<any>(event);

    const { private: privateMode, name, description, data: corvetteData } = await readBody(event) as { private?: boolean, name: string, description?: string, data: object };

    console.log($user)

    const { data, error } = await client.from('corvettes')
        .upsert({
            private: privateMode,
            user_id: $user?.app_metadata?.public_id,
            name,
            description,
            data: corvetteData
        })
        .select('id, name, description, created_at')
        .single();

    if (error) {
        throw createError({ statusMessage: error.message });
    }

    return data;
});