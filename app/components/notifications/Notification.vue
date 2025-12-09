<template>
    <div :class="['notification', { hide }]">
        <slot name="before"></slot>

        <header>
            <div class="content">
                <div>{{ notification?.title }}</div>

                <div>{{ notification?.text }}</div>
            </div>
        </header>

        <ul class="buttons" v-if="showButtons && notification?.buttons?.length! > 0">
            <li v-for="button of notification?.buttons" :key="button?.label"
                @click.stop.prevent="button?.click ? button?.click($event) : null"
            >
                <div>
                    <div>{{ button?.label }}</div>

                    <div>{{ button?.text }}</div>
                </div>
            </li>
        </ul>

        <slot></slot>
    </div>
</template>

<script lang="ts" setup>

import { ref } from 'vue';

// * Types
import type { Notification } from '~/types/stores/notification';


const $emit = defineEmits({
    hide() {}
});


const props = defineProps<{
    notification: Notification;
    showButtons?: boolean;
}>();


const hide = ref<boolean>(false);

</script>

<style lang="scss" scoped>

.notification {
    pointer-events: all;
    padding: 12px;
    max-width: 512px;
    min-width: 215px;
    position: relative;
    border: 1px dashed #ffffff55;
    background-color: #000;
    backdrop-filter: blur(10px);
    transition: .2s;

    header {
        display: flex;
        position: relative;
        align-items: center;

        .content {
            max-width: 100%;
            min-width: 0;

            div {
                max-width: 100%;
                text-overflow: ellipsis;
                overflow: hidden;

                &:nth-child(1) {
                    font-size: 14px;
                    font-weight: 600;
                    white-space: nowrap;
                }

                &:nth-child(2) {
                    display: -webkit-box;
                    // color: var(--text-primary);
                    font-size: 12px;
                    line-clamp: 2;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }
            }
        }
    }

    ul.buttons {
        display: grid;
        margin-top: 8px;
        grid-template-columns: repeat(2, 1fr);
        gap: 2px;
        overflow: hidden;
        user-select: none;

        li {
            cursor: pointer;
            display: flex;
            padding: 8px;
            align-items: center;
            border: 1px dashed #ffffff55;
            box-sizing: border-box;
            transition: .2s;

            &:hover {
                border: 1px solid #fff;
            }

            &:nth-child(2n + 1):not(:has(+ li)) {
                grid-column: span 2;
            }

            & > div {
                max-width: 100%;
                min-width: 0;

                div {
                    max-width: 100%;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    overflow: hidden;

                    &:nth-child(1) {
                        font-size: 14px;
                    }

                    &:nth-child(2) {
                        color: var(--text-primary);
                        font-size: 12px;
                    }
                }
            }
        }
    }

    ul.options {
        position: absolute;
        right: -10px;
        top: -10px;

        li {
            cursor: pointer;
            display: flex;
            width: 20px;
            height: 20px;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            border: 1px solid var(--background-primary);
            background-color: var(--background-secondary);

            i {
                font-size: 14px;
            }
        }
    }
}

</style>