<template>
    <header>
        <NuxtLink to="/">
            <div class="logo">
                <span>NMS Corvettes</span>
            </div>
        </NuxtLink>

        <div style="margin-left: auto;"></div>

        <Account/>
    </header>
</template>

<script lang="ts" setup>

// * Components
import Account from './Account.vue';

</script>

<style lang="scss" scoped>

header {
    display: flex;
    padding: 0 20%;
    margin: 0 auto;
    width: 100vw;
    height: 48px;
    position: fixed;
    top: 0;
    left: 0;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    z-index: 100;
    gap: 12px;
}

a {
    color: #fff;
    text-decoration: none;
}

.logo {
    display: flex;
    align-items: center;
    font-family: 'GeosansLightNMS', Helvetica, Arial, sans-serif;

    &:hover {
        text-decoration: underline;
    }

    img {
        margin-right: 8px;
        width: 42px;
        filter: invert(1);
    }

    span {
        font-size: 18px;
        font-weight: 100;
    }
}

.link {
    font-size: 14px;
    opacity: .7;

    &:hover {
        text-decoration: underline;
        opacity: 1;
    }
}

</style>