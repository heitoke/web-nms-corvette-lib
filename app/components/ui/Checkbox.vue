<template>
    <label class="ui-checkbox">
        <input type="checkbox" v-model="value">

        <div></div>

        <span>{{ text }}</span>
    </label>
</template>

<script lang="ts" setup>

const value = defineModel();

const props = defineProps<{
    text: string;
}>();

</script>

<style lang="scss" scoped>

label.ui-checkbox {
    cursor: pointer;
    display: flex;
    align-items: center;
    user-select: none;

    input {
        display: none;

        &:checked + div {
            border: 1px solid #fff;
            background-color: #fff;
        }
    }

    div {
        margin-right: 8px;
        max-width: 20px;
        width: 20px;
        min-width: 20px;
        max-height: 20px;
        height: 20px;
        min-height: 20px;
        border: 1px dashed #ffffff25;
        transition: .2s;
    }


}

</style>