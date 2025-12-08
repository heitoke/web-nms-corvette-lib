<template>
    <main class="upload">
        <section class="start">
            <h2 class="title">Upload Corvettes</h2>
    
            <div class="point">
                <div>1</div>
    
                <span>First, select the save file from the No Man's Sky game.</span>
            </div>
    
            <DecoderLocalSave
                @upload="onUploadLocalSave($event.data)"
            />
        </section>

        <section class="corvettes" v-if="step > 0">
            <div class="point">
                <div>2</div>

                <span>Then select the corvette you want to load.</span>
            </div>

            <ul>
                <li v-for="(corvette, idx) in listLocalCorvettes"
                    :class="{ active: selected === idx }"

                    @click="selectCorvette(idx)"
                >
                    <div class="name">{{ corvette.ship.Name }}</div>
                    <div class="size">Size: ~{{ corvette?.size }}</div>
                    <div class="size">Objects: ~{{ corvette?.base?.Objects?.length - 1 }}</div>
                </li>
            </ul>
        </section>

        <section class="info" v-if="step > 1">
            <div class="point">
                <div>3</div>

                <span>Customize how your corvette will look in the list of all corvettes.</span>
            </div>

            <div class="inputs">
                <UIInput placeholder="Name crovette"
                    v-model:model-value="corvetteInfo.name"
                />

                <UIInput placeholder="Description"
                    v-model:model-value="corvetteInfo.description"
                />

                <UICheckbox text="Do you want your Corvette not to be shown in the general list?"
                    v-model:model-value="corvetteInfo.private"
                />
            </div>

            <UIFile name="images" accept="image/png, image/jpeg" style="margin-top: 12px;"
                :multiple="true"

                @upload="onInputFiles"
            />

            <div class="images" v-if="images?.length > 0">
                <div class="image" v-for="({ url }, idx) of images" :key="idx">
                    <img :src="url" alt="Image">

                    <div class="remove"
                        @click="removeImage(idx)"
                    >Remove</div>
                </div>
            </div>
        </section>

        <section class="end" v-if="corvetteInfo?.name !== ''">
            <div class="point">
                <div>4</div>

                <span>Click on the button below to share your corvettes.</span>
            </div>

            <UIButton @click="uploadLocalCorvette">
                <span>Upload corvette {{ listLocalCorvettes[selected]?.ship?.Name }}</span>
            </UIButton>
        </section>
    </main>
</template>

<script lang="ts" setup>

import DecoderLocalSave from '~/components/editor/Decoder.vue';

// * Types
import type { SaveTopLevel, ShipOwnership, PersistentPlayerBase } from '~~/types/editor/save';

const $user = useSupabaseUser();


const step = ref(0);
const listLocalCorvettes = ref<Array<{ ship: ShipOwnership, base: PersistentPlayerBase, size: string }>>([]);
const selected = ref(-1);
const corvetteInfo = ref({
    private: false,
    name: '',
    description: ''
});
const images = ref<Array<{
    index: number;
    url: string;
}>>([]);

const dataImages: Array<File> = [];


function getObjectSize(obj: object) {
    const str = JSON.stringify(obj);
    return new TextEncoder().encode(str).length;
}

function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = Math.pow(10, decimals);
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

async function uploadImages(corvetteId: number) {
    const chunkSize = 1024 * 1024;

    for (let i = 0; i < dataImages.length; i++) {
        const file = dataImages[i];

        if (!file) continue;

        const blob = new Blob([file], { type: file.type });

        const totalChunks = Math.ceil(blob.size / chunkSize);

        for (let j = 0; j < totalChunks; j++) {
            const start = j * chunkSize;
            const end = Math.min(start + chunkSize, blob.size);
            const chunk = blob.slice(start, end);

            const formData = new FormData();
            formData.append('chunk', chunk, file.name);

            const data = await $fetch<{ id: number }>(`/api/corvettes/${corvetteId}/images?imageIndex=${i}&totalImages=${dataImages.length}&chunkIndex=${j}&totalChunks=${totalChunks}&state=corvette-${corvetteId}`, {
                body: formData,
                method: 'POST'
            });

            console.log(data);
        }
    }
    
    // for (let i = 0; i < totalChunks; i++) {
    //     const start = i * chunkSize;
    //     const end = Math.min(start + chunkSize, blob.size);
    //     const chunk = blob.slice(start, end);

    //     const formData = new FormData();
    //     formData.append('file', chunk);
    //     formData.append('imageIndex', String(i));
    //     formData.append('totalImages', String(i));
    //     formData.append('chunkIndex', String(i));
    //     formData.append('totalChunks', String(totalChunks));
    //     formData.append('state', `corvette-${corvetteId}`);

    //     const res = await fetch('https://nms-save-conversion-api.vercel.app/save/hg2', {
    //         method: 'POST',
    //         body: formData,
    //     });
    //     // const formData = new FormData();

    //     // for (const file of dataImages) {
    //     //     const blob = new Blob([file], { type: file.type });
            
    //     //     // file.slice(0, file.size, file.type);
    //     //     formData.append('images', blob, file.name);
    //     // }

    //     // const data = await $fetch<{ id: number }>(`/api/corvettes/${corvetteData?.id}/images`, {
    //     //     body: formData,
    //     //     method: 'POST'
    //     // });

    //     // console.log(data)

    //     // if (!data?.id) return;
    // }

    return true;
}

function onUploadLocalSave(data: SaveTopLevel) {
    const ships = data.BaseContext.PlayerStateData.ShipOwnership;
    const bases = data.BaseContext.PlayerStateData.PersistentPlayerBases;

    if (ships.length < 1) return;

    step.value = 1;

    listLocalCorvettes.value = [];

    ships.forEach((ship, index) => {
        if (ship.Resource.Filename !== 'MODELS/COMMON/SPACECRAFT/BIGGS/BIGGS.SCENE.MBIN') return;
    
        const base = bases.find(b => b.UserData === index);

        if (!base) return;

        const data = { ship, base }
    
        const sizeBytes = getObjectSize(data);

        listLocalCorvettes.value.push({
            ...data,
            size: formatBytes(sizeBytes)
        });
    });
}

function selectCorvette(index: number) {
    const corvette = listLocalCorvettes.value[index];

    if (!corvette) return;

    step.value = 2;
    selected.value = index;
    corvetteInfo.value.name = corvette?.ship?.Name;
}

async function uploadLocalCorvette() {
    const corvette = listLocalCorvettes.value[selected.value];

    if (!corvette) return;

    const corvetteData = await $fetch<{ id: number }>('/api/corvettes', {
        body: {
            ...corvetteInfo.value,
            data: {
                ship: corvette.ship,
                base: corvette.base
            }
        },
        method: 'POST'
    });

    if (!corvetteData?.id) return;

    const resultImages = await uploadImages(corvetteData?.id);

    if (!resultImages) return;

    await navigateTo('/corvettes');
}

async function onInputFiles(files: FileList) {
    images.value = [];

    for (const file of files) {
        const index = dataImages.push(file);

        images.value.push({
            index,
            url: URL.createObjectURL(file)
        });
    }
}

function removeImage(index: number) {
    const image = images.value[index];

    if (!image) return;

    dataImages.splice(image.index, 1);

    images.value.splice(index, 1);
}

</script>

<style lang="scss" scoped>

.page.upload {
    background-color: #000;

    .title {
        font-size: 32px;
        font-family: 'GeosansLightNMS', Helvetica, Arial, sans-serif;
        font-weight: 100;
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

    section:not(:first-child) {
        margin-top: 12px;
        border-top: 1px solid #ffffff55;
    }

    section.corvettes {
        ul {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;

            li {
                cursor: pointer;
                padding: 12px;
                border: 1px dashed #ffffff25;
                transition: .2s;

                &:hover,
                &.active {
                    border: 1px solid #fff;
                }

                .name {
                    font-size: 18px;
                    font-family: 'GeosansLightNMS', Helvetica, Arial, sans-serif;
                    font-weight: 100;
                }

                .size {
                    font-size: 12px;
                    opacity: .7;
                }
            }
        }
    }

    .images {
        display: grid;
        margin-top: 12px;
        position: relative;
        grid-template-columns: repeat(5, 1fr);
        gap: 12px;

        .image {
            max-width: 100%;
            position: relative;

            img {
                max-width: 100%;
                object-fit: cover;
                object-position: center;
            }

            .remove {
                cursor: pointer;
                padding: 8px;
                position: absolute;
                top: 0;
                right: 0;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                background-color: #00000025;
                user-select: none;
            }
        }
    }

    .inputs {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
}

</style>