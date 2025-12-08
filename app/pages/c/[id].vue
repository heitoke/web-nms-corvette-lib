<template>
    <main class="corvette">
        <h1>Corvette: {{ corvette?.name }}</h1>

        <Slider :inset="true" :items="corvette?.images!" v-if="corvette?.images?.length && corvette?.images?.length > 0">
            <template #item="{ item, index }">
                <img :src="item?.url" alt="Corvette Image"></img>
            </template>
        </Slider>

        <p>{{ corvette?.description }}</p>

        <Point iconText="!" text="Before using it, be sure to make a backup copy of your save to avoid unpleasant situations in the future."/>

        <UIDialog v-if="!isExperienced">
            <template #trigger="{ show }">
                <UIButton @click="show">Transfer to your own save</UIButton>
            </template>

            <div>
                <h1>Importing a Corvette into your game save</h1>

                <Point iconText="1">
                    <div>First you need to select your save file <b>(Be sure to make a backup copy of your save)</b></div>

                    <p>You can find them in:</p>

                    <ul style="list-style-type: disc; padding-left: 20px; padding-right: 30px; margin: 1em 0;">
                        <li style="list-style-type: disc;">
                            <p><b>Windows:</b> <i>C:\Users\[Username]\AppData\Roaming\HelloGames\NMS\</i></p>
                            <p><b>Windows Microsoft Store:</b> <i>C:\Users\[Username]\AppData\Local\Packages\HelloGames.NoMansSky_bs190hzg1sesy\LocalState\SAVES\</i></p>
                        </li>
                        <li style="list-style-type: disc;">
                            <p><b>Linux:</b> <i>/steamapps/compatdata/275850/pfx/</i> or <i>~/.steam/steam/userdata/[UserID]/275850/</i></p>
                        </li>
                        <li style="list-style-type: disc;">
                            <p><b>MacOS:</b> <i>/Users/[Username]/Library/Application Support/HelloGames/NMS</i></p>
                        </li>
                    </ul>

                    <p>After you have found the save file, save*.hg, drag it to the bottom field.</p>
                </Point>
                
                <DecoderLocalSave style="padding: 12px;"
                    @upload="onInsertCorvette"
                />
                
                <Point iconText="2" text="Next, a corvette is inserted into your save file and the finished save file will be downloaded in a couple of seconds."/>
                
                <Point iconText="3" text="In the end, you will need to replace your save that you selected with the downloaded save."/>

                <UICheckbox text="Don't show it anymore, I've learned!"
                    :model-value="isExperienced"

                    @update:model-value="setExperienced($event)"
                />
            </div>
        </UIDialog>

        <label v-else>
            <UIButton @click="onInsertClick">Transfer to your own save</UIButton>

            <DecoderLocalSave id="import-nms-save" style="display: none;"
                @upload="onInsertCorvette"
            />
        </label>

        <UIDialog :open="isLoading" :close-on-click-outside="false">
            <div>
                <span>Please wait.</span>
            </div>
        </UIDialog>
    </main>
</template>

<script lang="ts" setup>

import DecoderLocalSave from '~/components/editor/Decoder.vue';
import Slider from '~/components/Slider.vue';
import Point from '~/components/Point.vue';

import * as nmsSaveTool from '~/lib/nms-save-tool';

import { Mapping } from '~/assets/mapping.json';

// * Types
import type { SaveTopLevel, ShipOwnership, PersistentPlayerBase } from '~~/types/editor/save';

interface ICorvette {
    ship: ShipOwnership;
    base: PersistentPlayerBase;
}



const $route = useRoute();


const isExperienced = ref(false);
const isLoading = ref(false);

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
    document.getElementById('import-nms-save')?.click();
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
}

async function onInsertCorvette({ file, data }: { file: File, data: SaveTopLevel }) {
    isLoading.value = true;

    const copyData = await fetchCorvetteData();

    if (!copyData) return;

    const indexCopyCorvette = data.BaseContext.PlayerStateData.ShipOwnership.findIndex(s => {
        return !s.Resource.Filename;
    });

    data.BaseContext.PlayerStateData.ShipOwnership.splice(indexCopyCorvette, 0, {
        ...copyData.ship,
        Name: corvette.value?.name || copyData.ship?.Name
    });

    data.BaseContext.PlayerStateData.PersistentPlayerBases.push({
        ...copyData.base,
        UserData: indexCopyCorvette
    });

    data.BaseContext.PlayerStateData.TimeStamp = Math.floor(Date.now() / 1000);

    const json = await nmsSaveTool.applyMapping(data, Mapping);

    const id = `import-corvette-${corvette.value?.id}-${Math.random()}`

    await uploadJson(json, id);

    isLoading.value = false;
}


function setExperienced(bool: boolean) {
    isExperienced.value = bool;

    localStorage.setItem('isExperienced', String(bool));
}

onMounted(() => {
    isExperienced.value = Boolean(localStorage['isExperienced'] === 'true');

    fetchCorvette();
});

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
}

</style>