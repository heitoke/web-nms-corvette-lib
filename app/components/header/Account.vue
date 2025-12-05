<template>
    <div class="account">
        <div class="account" v-if="$user">
            <div class="avatar">
                <img :src="$user.user_metadata?.avatar_url" alt="User Avatar"></img>
            </div>
        </div>

        <NuxtLink to="/login" v-else>
            <UIButton>
                <span>Login</span>
            </UIButton>
        </NuxtLink>
    </div>
</template>

<script lang="ts" setup>

const $supabase = useSupabaseClient();
const $user = useSupabaseUser();

async function signOut() {
    const { error } = await $supabase.auth.signOut();

    if (error) console.log(error)
}

</script>

<style lang="scss" scoped>

.account {
    position: relative;

    .avatar {
        cursor: pointer;
        width: 42px;
        height: 42px;
        background-color: var(--background-secondary);
        clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
        overflow: hidden;
        
        img {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            object-fit: cover;
            object-position: center;
        }
    }
}

</style>