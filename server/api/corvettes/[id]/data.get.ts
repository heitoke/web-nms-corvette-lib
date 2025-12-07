import { createError } from 'h3';
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event);

    const corvetteId = getRouterParam(event, 'id');

    const { data, error } = await client.from('corvettes').select('id, data').eq('id', Number(corvetteId!));

    if (error) {
        throw createError({ statusMessage: error.message });
    }

    // const res = await fetch(`https://pastebin.com/raw/${data[0]?.data}`);

    // if (!res?.ok) {
    //     throw createError({ statusMessage: 'error' });
    // }

    // const json = await res.json();

    return {
        id: data[0]?.id,
        data: data[0]?.data
    };
});