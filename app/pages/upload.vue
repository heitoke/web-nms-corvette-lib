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

function onUploadLocalSave(data: SaveTopLevel) {
    console.log(data, data.BaseContext.PlayerStateData.ShipOwnership, data.BaseContext.PlayerStateData.PersistentPlayerBases);
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
    })

    if (!corvetteData?.id) return;

    await navigateTo('/corvettes');
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

    .inputs {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
}

</style>