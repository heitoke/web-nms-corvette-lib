<template>
    <div class="ui-slider">
        <div class="slider-button prev"
            @click="setSlide(slideIndex - 1)"
        ><</div>

        <div class="slides" :style="{ transform: `translateX(calc(${slideIndex} * -100%))` }">
            <template v-for="(item, index) in items" :key="index">
                <div class="slide">
                    <slot name="item" v-bind="{ item, index }"></slot>
                </div>
            </template>
        </div>

        <div class="slider-button next"
            @click="setSlide(slideIndex + 1)"
        >></div>
    </div>
</template>

<script lang="ts" setup>

const props = defineProps<{
    items: Array<any>;
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
        background: red;
        transition: .2s;
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