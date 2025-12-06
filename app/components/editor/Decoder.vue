<template>
    <input type="file"
        name="nms-save"
        id="nms-save"
        accept=".hg, .json"
        
        @input="onInputFile"
    >
</template>

<script lang="ts" setup>

import * as y from '~/lib/nms-save-tool';

import type { SaveTopLevel } from '~~/types/editor/save';


const $emit = defineEmits({
    upload(data: { file: File, data: SaveTopLevel }) {
        return data;
    }
});



async function onInputFile(event: InputEvent) {
    const file = (event.target as HTMLInputElement).files![0];

    if (!file) return;

    console.log(file.name);

    try {
        const a = await y.decodeFile(file);

        $emit('upload', {
            file,
            data: JSON.parse(a) as any
        });
    } catch (error) {
        console.error(error);
    }
}

</script>