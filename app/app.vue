<template>
    <Header/>

    <NuxtPage class="page"/>
</template>

<script lang="ts" setup>

import Header from '~/components/header/Index.vue';

</script>

<style lang="scss">

.page {
    padding-top: 64px;
    padding-left: 10%;
    padding-right: 10%;
    width: 100vw;
    height: 100vh;
    position: relative;
    transition: opacity .5s, transform .5s;
    overflow-x: hidden;
    box-sizing: border-box;
}

.fade-enter-active,
.fade-leave-active {
    transform: translateY(-64px);
    opacity: 0;
}


@media (max-width: 1280px) {
    .page {
        padding: 12px 12px 32px 12px;
    }
}

</style>