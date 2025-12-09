<template>
    <button class="ui-button">
        <slot/>
    </button>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>

button.ui-button {
    cursor: pointer;
    display: flex;
    padding: 10px 16px;
    position: relative;
    color: #fff;
    white-space: nowrap;
    border: none;
    align-items: center;
    justify-content: center;
    background-color: #ffffff25;
    backdrop-filter: blur(5px);
    transition: color .2s;
    overflow: hidden;
    outline: none;
    gap: 8px;

    &:hover {
        color: #000;

        &::after {
            left: 0;
        }
    }

    &:active {
        transform: scale(.9);
    }

    &::after {
        content: "";
        position: absolute;
        top: 0;
        left: calc(-100% + 3px);
        width: 100%;
        height: 100%;
        background-color: #ffffff75;
        transition: .2s;
        z-index: -1;
    }
}

</style>