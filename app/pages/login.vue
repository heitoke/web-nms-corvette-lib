<template>
    <div class="login">
        <main>
            <h1>A</h1>

            <p>D</p>

            <Button variant="outline" v-for="({ name, logoUrl }, key) in providers" :key="key"
                @click="signInWithOAuth(key)"
            >
                <img :src="logoUrl" alt="Logo Provider">
                <span>{{ name }}</span>
            </Button>
        </main>
    </div>
</template>

<script lang="ts" setup>

import { providers, type ProviderName } from '~~/types/user';


const $supabase = useSupabaseClient();
const $user = useSupabaseUser();

const $url = useRequestURL();


if ($user.value?.id) {
    await navigateTo(`/`);
}


async function signInWithOAuth(provider: ProviderName) {
    const url = useRequestURL();

    const { error } = await $supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: `${$url.origin}/confirm`
        },
    });

    if (error) console.log(error);
}



</script>

<style lang="scss" scoped>

.page.login {
    display: flex;
    width: 100%;
    height: calc(100vh - 128px);
    align-items: center;
    justify-content: center;
    box-sizing: border-box;

    main {
        display: flex;
        padding: 12px;
        width: 315px;
        border-radius: 7px;
        border: 1px solid var(--secondary);
        flex-direction: column;
        gap: 8px;

        h1 {
            font-size: 20px;
            font-weight: 700;
        }

        p {
            font-size: 14px;
        }
    }

    button {
        img {
            width: 20px;
            height: 20px;
        }
    }
}

</style>