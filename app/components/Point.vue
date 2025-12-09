<template>
    <div class="ui-point">
        <div class="icon">
            <slot name="icon">{{ iconText }}</slot>
        </div>
            
        <div class="content">
            <slot>{{ text }}</slot>
        </div>
    </div>
</template>

<script lang="ts" setup>

const props = defineProps<{
    iconText?: string;
    text?: string;
}>();

</script>

<style lang="scss" scoped>
    
.ui-point {
    display: flex;
    margin: 12px 0;
    
    .icon {
        display: flex;
        margin-right: 12px;
        max-width: 32px;
        min-width: 32px;
        height: 32px;
        font-size: 16px;
        border: 1px dashed #fff;
        align-items: center;
        justify-content: center;
    }

    .content {
        margin-top: 7px;
    }
}

</style>