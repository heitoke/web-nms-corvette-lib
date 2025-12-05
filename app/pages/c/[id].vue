<template>
    <main class="corvette">
        <h1>Corvette: {{ corvette?.name }}</h1>
        <p>{{ corvette?.description }}</p>

        <label>
            <UIButton
                @click="onInsertClick"
            >Transfer to your own save</UIButton>

            <DecoderLocalSave style="display: none;" id="test"
                @upload="onInsertCorvette"
            />
        </label>
    </main>
</template>

<script lang="ts" setup>

import DecoderLocalSave from '~/components/editor/Decoder.vue';

import nmsSaveTool from '~/lib/nms-save-tool';

import { Mapping } from '~/assets/mapping.json';

// * Types
import type { SaveTopLevel, ShipOwnership, PersistentPlayerBase } from '~~/types/editor/save';
import { processSaveFile } from '~/lib/editor/a';

interface ICorvette {
    ship: ShipOwnership;
    base: PersistentPlayerBase;
}



const $route = useRoute();

const $user = useSupabaseUser();


const corvette = ref<{ id: number, name: string, description?: string, created_at: number }>();


async function fetchCorvette() {
    const data = await $fetch(`/api/corvettes/${$route.params.id}`);

    if (!data) return navigateTo('/corvettes');

    corvette.value = data as any;
}

async function fetchCorvetteData() {
    const data = await $fetch(`/api/corvettes/${$route.params.id}/data`);

    if (!data) return null;

    return data?.data as ICorvette;
}

function onInsertClick() {
    document.getElementById('test')?.click();
}


// function downloadFile(data: string, fileName: string) {
//     const blob = new File([data], fileName, { type: 'application/json' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = fileName;
//     a.click();
//     URL.revokeObjectURL(url);
// }



// const reverseMapKeys = (json: object, mapping: typeof Mapping) => {
//     if (Array.isArray(json)) {
//         return json.map((item) => reverseMapKeys(item, mapping));
//     } else if (typeof json === 'object' && json !== null) {
//         const newJson = {};

//         for (const key in json) {
//             const mappedKey = mapping.find((m) => m.Value === key)?.Key;

//             if (mappedKey) {
//                 newJson[mappedKey] = reverseMapKeys(json[key], mapping);
//             } else {
//                 newJson[key] = reverseMapKeys(json[key], mapping);
//             }
//         }

//         return newJson;
//     } else {
//         return json;
//     }
// }


function downloadFile(buffer: Buffer, filename: string) {
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

async function onInsertCorvette({ file, data }: { file: File, data: SaveTopLevel }) {
    const copyData = await fetchCorvetteData();

    if (!copyData) return;

    console.log(file, data, copyData)
    console.log(data.BaseContext.PlayerStateData.ShipOwnership);

    const indexCopyCorvette = data.BaseContext.PlayerStateData.ShipOwnership.findIndex(s => {
        return !s.Resource.Filename;
    });

    data.BaseContext.PlayerStateData.ShipOwnership.splice(indexCopyCorvette, 0, {
        ...copyData.ship,
        Name: corvette.value?.name || copyData.ship?.Name
    });

    console.log(indexCopyCorvette);

    data.BaseContext.PlayerStateData.PersistentPlayerBases.push({
        ...copyData.base,
        UserData: indexCopyCorvette
    });

    data.BaseContext.PlayerStateData.TimeStamp = Math.floor(Date.now() / 1000);

    const resultData = await nmsSaveTool.processFile(file);

    // const json = reverseMapKeys(data, Mapping);
    // const sJson = JSON.stringify(data, null, 4);

    // downloadFile(sJson, file.name);

    // console.log('new data', data)

    // const text = JSON.stringify(data)
    // const hgBuffer = await nmsSaveTool.encode(text);
      
    // // Скачиваем результат как .hg файл
    // downloadFile(hgBuffer, file.name);
}


onMounted(() => {
    fetchCorvette();
})

</script>

<style lang="scss" scoped>

.page.corvette {
    background-color: #000;
    
    h1 {
        font-family: 'GeosansLightNMS', Helvetica, Arial, sans-serif;
        font-weight: 100;
    }
}

</style>