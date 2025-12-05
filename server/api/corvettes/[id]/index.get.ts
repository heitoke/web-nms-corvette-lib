import { createError } from 'h3';
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event);

    const corvetteId = getRouterParam(event, 'id');

    console.log(corvetteId)

    const { data, error } = await client.from('corvettes').select('id, name, description, created_at').eq('id', corvetteId!);

    if (error) {
        throw createError({ statusMessage: error.message });
    }

    return data[0];
});