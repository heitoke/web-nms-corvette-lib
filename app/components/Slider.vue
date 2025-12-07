<template>
    <div :class="['ui-slider', { inset }]">
        <div class="slider-button prev" v-show="items?.length > 0"
            @click.stop.prevent="setSlide(slideIndex - 1)"
        ><</div>

        <div class="slides" :style="{ transform: `translateX(calc(${slideIndex} * -100%))` }">
            <template v-for="(item, index) in items" :key="index">
                <div :class="['slide', { active: slideIndex === index }]">
                    <slot name="item" v-bind="{ item, index }"></slot>
                </div>
            </template>
        </div>

        <div class="slider-button next" v-show="items?.length > 0"
            @click.stop.prevent="setSlide(slideIndex + 1)"
        >></div>
    </div>
</template>

<script lang="ts" setup>

const props = defineProps<{
    items: Array<any>;
    inset?: boolean;
}>();


const slideIndex = ref(0);


function setSlide(index: number) {
    const max = props.items.length - 1;

    if (index < 0) {
        slideIndex.value = max;
    } else if (index > max) {
        slideIndex.value = 0;
    } else {
        slideIndex.value = index;
    }
}

</script>

<style lang="scss" scoped>

div.ui-slider {
    position: relative;

    &:hover {
        .slider-button {
            opacity: 1;
        }
    }

    &.inset {
        .slider-button {
            &.prev {
                transform: translateX(calc(-100% - 12px));
            }

            &.next {
                transform: translateX(calc(100% + 12px));
            }
        }
    }

    .slides {
        display: flex;
        max-width: 100%;
        position: relative;
        align-items: center;
        transition: .2s;
        z-index: 1;

        .slide {
            max-width: 100%;
            width: 100%;
            min-width: 100%;
            flex: 1;
        }
    }

    .slider-button {
        cursor: pointer;
        padding: 12px;
        position: absolute;
        top: 50%;
        background: #00000055;
        transition: .2s;
        user-select: none;
        opacity: 0;
        z-index: 2;
    
        &.prev {
            left: 0;
        }
    
        &.next {
            right: 0;
        }
    }
}

</style>