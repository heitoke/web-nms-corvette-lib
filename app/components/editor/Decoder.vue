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

// * Types
import { Mapping as mapping } from '~/assets/mapping.json';
import type { SaveTopLevel } from '~~/types/editor/save';

// * Stores
// import { useLocalSaveStore } from '~/stores/localSave';


const $emit = defineEmits({
    upload(data: { file: File, data: SaveTopLevel }) {
        return data;
    }
});


// const $localSave = useLocalSaveStore();




async function onInputFile(event: InputEvent) {
    const file = (event.target as HTMLInputElement).files![0];

    if (!file) return;

    console.log(file.name);

    try {
        // const a = await y.decodeFile(file);

        // y.downloadJson(a, 'save.json')

        const b = await y.encodeFile(file);

        y.downloadFile(b, 'save5.hg')

        // const resultData = await nmsSaveTool.convertFile(file);

        // console.log(resultData)
        // const arrayBuffer = await file.arrayBuffer();
        // const buffer = Buffer.from(arrayBuffer);

        // const jsonString = await nmsSaveTool.decode(buffer);
        // const jsonObject = JSON.parse(jsonString);
        // result.value = jsonObject;
        

        // const decompressedSave = (await decompressSave(file, mapping))
    
        // if (decompressedSave instanceof Error) throw decompressedSave;

        // $emit('upload', {
        //     file,
        //     data: resultData.data as any //jsonObject// decompressedSave as SaveTopLevel
        // });

        // $localSave.setFile(file);
        // $localSave.setData(decompressedSave as any);
    } catch (error) {
        console.error(error);
    }
}

</script>