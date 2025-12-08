<template>
    <slot name="trigger"
        :show="show"
        :hide="hide"
        :toggle="toggle"
    />

    <Teleport to="body">
        <Transition :name="typeof transition === 'string' ? transition : transition?.name">
            <div :class="['ui-dialog', ...dialogSide]" v-if="open"
                :style="{ '--gap-v': dialogPadding[0] + 'px', '--gap-h': dialogPadding[1] + 'px' }"
            >
                <div class="background"
                    @click.prevent.stop="closeOnClickOutside && hide()"
                ></div>

                <div class="content">
                    <slot name="default"/>

                    <div class="buttons">
                        <div @click="hide" v-if="closeOnClickOutside">⤫</div>

                        <div v-for="(button, idx) of buttons" :key="idx"
                            @click.prevent.stop="button?.click?.($event)"
                        ></div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script lang="ts" setup>

import { computed } from 'vue';

// * Types
export type Side = 'top' | 'right' | 'bottom' | 'left' | 'center';

export type Align = 'start' | 'end';

export interface DialogButton {
    icon?: string;
    label: string;
    text?: string;
    click?: (event: MouseEvent) => void;
}

type TransitionOptions = string | {
    name: string;
};


const open = defineModel<boolean>('open');


const props = withDefaults(defineProps<{
    side?: Side | [Side, Align];
    transition?: TransitionOptions;
    collisionPadding?: number | [number, number];
    closeOnClickOutside?: boolean;
    buttons?: Array<DialogButton>;
}>(), {
    side: () => 'center',
    transition: () => 'show-dialog',
    collisionPadding: () => 24,
    closeOnClickOutside: true,
    buttons: () => []
});



const dialogSide = computed(() => typeof props.side === 'string' ? [props.side, 'center'] : props.side);
const dialogPadding = computed(() => typeof props.collisionPadding === 'number' ? [props.collisionPadding, props.collisionPadding] : props.collisionPadding);



function show(event: MouseEvent) {
    open.value = true;
}

function hide() {
    open.value = false;
}

function toggle(event: MouseEvent) {
    if (open.value) hide();
    else show(event);
}

</script>

<style lang="scss" scoped>

.show-dialog-enter-active,
.show-dialog-leave-active {
    opacity: 0;

    .content {
        transform: scale(.65);
    }
}


.ui-dialog {
    display: flex;
    padding: var(--gap-v, 4px) var(--gap-h, 4px);
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    transition: .2s;
    z-index: 205;

    &.center,
    &.right,
    &.left {
        &.start { align-items: start; }
        &.end { align-items: end; }
    }

    &.top,
    &.bottom {
        &.start { justify-content: start; }
        &.end { justify-content: end; }
    }

    &.center { justify-content: center; }
    &.top { align-items: start; }
    &.right { justify-content: end; }
    &.bottom { align-items: end; }
    &.left { justify-content: start; }

    &.right,
    &.top.end,
    &.bottom.end {
        .buttons {
            left: -32px;
        }
    }


    .background {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        background-color: #00000095;
        transition: 2s;
        z-index: 1;
    }

    .content {
        padding: 12px;
        position: relative;
        border: 1px dashed #ffffff55;
        background-color: #000;
        transition: transform .2s;
        z-index: 2;
    }

    .buttons {
        position: absolute;
        top: 0;
        left: calc(100% + 8px);

        div {
            cursor: pointer;
            display: flex;
            width: 24px;
            height: 24px;
            border: 1px dashed #ffffff55;
            align-items: center;
            justify-content: center;
            background-color: #000;
        }
    }
}

</style>