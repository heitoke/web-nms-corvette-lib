import { createError } from 'h3';
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event);

    const { data, error } = await client.from('corvettes').select('id, name, images, description, created_at').eq('private', false).order('created_at');

    if (error) {
        throw createError({ statusMessage: error.message });
    }

    return data;
});