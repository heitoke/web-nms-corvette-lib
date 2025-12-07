<template>
    <UIFile name="nms-save" accept=".hg"
        @upload="onInputFile"
    />
</template>

<script lang="ts" setup>

import * as y from '~/lib/nms-save-tool';

import type { SaveTopLevel } from '~~/types/editor/save';


const $emit = defineEmits({
    upload(data: { file: File, data: SaveTopLevel }) {
        return data;
    }
});



async function onInputFile(files: FileList) {
    if (!files?.length) return;

    try {
        const data = await y.decodeFile(files[0]!);

        $emit('upload', {
            file: files[0]!,
            data: JSON.parse(data) as any
        });
    } catch (error) {
        console.error(error);
    }
}

</script>