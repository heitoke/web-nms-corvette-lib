<template>
    <div>Waiting for login...</div>
</template>

<script lang="ts" setup>

// * Stores

const $user = useSupabaseUser();


watch($user, async () => {
    if ($user.value) {
        return navigateTo(`/`);
    }
}, { immediate: true });

</script>