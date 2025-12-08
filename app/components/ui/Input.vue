<template>
    <label class="ui-input">
        <input type="text" v-model="value"
            :placeholder="placeholder"
        />
    </label>
</template>

<script lang="ts" setup>

const value = defineModel();

const props = defineProps<{
    placeholder?: string;
}>();

</script>

<style lang="scss" scoped>

label.ui-input {
    cursor: text;
    width: 100%;
    position: relative;
    padding: 10px 14px;
    border: 1px dashed #ffffff25;
    box-sizing: border-box;
    transition: .2s;

    input {
        width: 100%;
        border: none;
        background-color: transparent;
        outline: none;
    }

    &:has(> input:focus) {
        border: 1px solid #fff;
    }
}

</style>