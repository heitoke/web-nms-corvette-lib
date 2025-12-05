import { createError } from 'h3';
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const $user = await serverSupabaseUser(event);
    const client = await serverSupabaseClient(event);

    console.log($user)

    const { data, error } = await client.from('corvettes').select('id, name, description, created_at').eq('private', false).order('created_at');

    if (error) {
        throw createError({ statusMessage: error.message });
    }

    return data;
});