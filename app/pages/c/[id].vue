<template>
    <main class="corvette">
        <h1>Corvette: {{ corvette?.name }}</h1>

        <Slider :inset="true" :items="corvette?.images!" v-if="corvette?.images?.length && corvette?.images?.length > 0">
            <template #item="{ item, index }">
                <img :src="item?.url" alt="Corvette Image"></img>
            </template>
        </Slider>

        <p>{{ corvette?.description }}</p>

        <div class="point">
            <div>!</div>
    
            <span>Before using it, be sure to make a backup copy of your save to avoid unpleasant situations in the future.</span>
        </div>

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
import Slider from '~/components/Slider.vue';

import * as nmsSaveTool from '~/lib/nms-save-tool';

import { Mapping } from '~/assets/mapping.json';

// * Types
import type { SaveTopLevel, ShipOwnership, PersistentPlayerBase } from '~~/types/editor/save';

interface ICorvette {
    ship: ShipOwnership;
    base: PersistentPlayerBase;
}



const $route = useRoute();


const corvette = ref<{ id: number, name: string, images: Array<{ url: string, id: string }>, description?: string, created_at: number }>();


async function fetchCorvette() {
    const data = await $fetch(`/api/corvettes/${$route.params.id}`);

    if (!data) return navigateTo('/corvettes');

    corvette.value = data as any;
}

async function fetchCorvetteData() {
    const data = await $fetch(`/api/corvettes/${$route.params.id}/data`);

    if (!data) return null;

    return (data as any)?.data as ICorvette;
}

function onInsertClick() {
    document.getElementById('test')?.click();
}



async function uploadJson(jsonData: object, userId: string) {
    const jsonString = JSON.stringify(jsonData);
    
    const blob = new Blob([jsonString], { type: 'application/json' });

    const chunkSize = 1024 * 1024;
    const totalChunks = Math.ceil(blob.size / chunkSize);
    
    for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, blob.size);
        const chunk = blob.slice(start, end);

        const formData = new FormData();
        formData.append('file', chunk);
        formData.append('chunkIndex', String(i));
        formData.append('totalChunks', String(totalChunks));
        formData.append('userId', userId);

        const res = await fetch('https://nms-save-conversion-api.vercel.app/save/hg2', {
            method: 'POST',
            body: formData,
        });

        console.log('chunk', i, totalChunks, res);

        if (res.ok && i === totalChunks - 1) {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `save.hg`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            break;
        } else if (!res.ok) {
            console.error('Ошибка при отправке:', res.statusText);
        }
    }

    console.log('JSON успешно загружен!');
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

    const json = await nmsSaveTool.applyMapping(data, Mapping)

    await uploadJson(json, String(corvette.value?.id))
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

    ::v-deep(.ui-slider) {
        .slide:has(+ .slide.active) {
            transform: translateX(-64px);
        }
        .slide.active + .slide {
            transform: translateX(64px);
        }
    }

    img {
        max-width: 100%;
        width: 100%;
        min-height: 215px;
        // height: 215px;
        // max-height: 215px;
        object-fit: cover;
        object-position: center;
        transition: .2s;
        box-sizing: border-box;
    }

    .point {
        display: flex;
        margin: 12px 0;
        
        div {
            display: flex;
            margin-right: 12px;
            width: 32px;
            height: 32px;
            font-size: 20px;
            border: 1px dashed #fff;
            align-items: center;
            justify-content: center;
        }

        span {
            margin-top: 7px;
        }
    }
}

</style>