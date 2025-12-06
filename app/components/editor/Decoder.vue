<template>
    <label class="decoder">
        <div class="fake-btn">Choose file</div>
        <span class="file-msg">or drag and drop file here</span>

        <input type="file"
            name="nms-save"
            id="nms-save"
            accept=".hg, .json"
            
            @input="onInputFile($event as any)"
        >
    </label>
</template>

<script lang="ts" setup>

import * as y from '~/lib/nms-save-tool';

import type { SaveTopLevel } from '~~/types/editor/save';


const $emit = defineEmits({
    upload(data: { file: File, data: SaveTopLevel }) {
        return data;
    }
});



async function onInputFile(event: InputEvent & { target: HTMLInputElement }) {
    const file = (event.target as HTMLInputElement).files![0];

    if (!file) return;

    try {
        const a = await y.decodeFile(file);

        const container = event.target.parentElement!;
        container.classList.add('active');

        const msg = container?.querySelector('.file-msg')!;

        msg.textContent = file.name;

        $emit('upload', {
            file,
            data: JSON.parse(a) as any
        });
    } catch (error) {
        console.error(error);
    }
}

</script>

<style lang="scss" scoped>

.decoder {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 100%;
    padding: 24px;
    border: 1px dashed #ffffff25;
    transition: 0.2s;

    &:hover,
    &.active {
        border: 1px solid #fff;

        .fake-btn {
            border: 1px solid #fff;
            background-color: #ffffff25;
        }
    }

    .fake-btn {
        flex-shrink: 0;
        background-color: #ffffff15;
        border: 1px dashed #ffffff25;
        padding: 8px 15px;
        margin-right: 10px;
        font-size: 12px;
        text-transform: uppercase;
        transition: .2s;
    }

    .file-msg {
        font-weight: 300;
        line-height: 1.4;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    input {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 100%;
        cursor: pointer;
        opacity: 0;
        &:focus {
            outline: none;
        }
    }
}

</style>