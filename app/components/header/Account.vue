<template>
    <div class="account">
        <div class="account" v-if="$user">
            <div class="avatar" @click="opened = !opened">
                <img :src="$user.user_metadata?.avatar_url" alt="User Avatar"></img>
            </div>

            <div class="panel" v-if="opened">
                <UIButton @click="signOut()">
                    <span>Exit</span>
                </UIButton>
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

const opened = ref(false);

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

    .panel {
        padding: 12px;
        position: absolute;
        top: calc(42px + 8px);
        right: 0;
        border: 1px dashed #ffffff15;
        background-color: #000;
    }
}

</style>