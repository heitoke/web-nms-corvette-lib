<template>
    <main class="upload">
        <DecoderLocalSave
            @upload="onUploadLocalSave($event.data)"
        />

        <template v-if="step > 0">
            <ul>
                <li v-for="(corvette, idx) in listLocalCorvettes"
                    @click="selectCorvette(idx)"
                >
                    <span>{{ corvette.ship.Name }}</span>
                </li>
            </ul>
        </template>

        <template v-if="step > 1">
            <input type="text" placeholder="Name" style="color: #000;"
                v-model="corvetteInfo.name"
            >

            <br>

            <input type="text" placeholder="Description" style="color: #000;"
                v-model="corvetteInfo.description"
            >

            <br>

            <label>
                <input type="checkbox" v-model="corvetteInfo.private">

                <span>Private mode?</span>
            </label>

            <br>

            <UIButton @click="uploadLocalCorvette" v-if="corvetteInfo?.name !== ''">
                <span>Upload corvette {{ listLocalCorvettes[selected]?.ship?.Name }}</span>
            </UIButton>
        </template>
    </main>
</template>

<script lang="ts" setup>

import DecoderLocalSave from '~/components/editor/Decoder.vue';

// * Types
import type { SaveTopLevel, ShipOwnership, PersistentPlayerBase } from '~~/types/editor/save';

const $user = useSupabaseUser();


const step = ref(0);
const listLocalCorvettes = ref<Array<{ ship: ShipOwnership, base: PersistentPlayerBase }>>([]);
const selected = ref(-1);
const corvetteInfo = ref({
    private: false,
    name: '',
    description: ''
});

function onUploadLocalSave(data: SaveTopLevel) {
    console.log(data, data.BaseContext.PlayerStateData.ShipOwnership, data.BaseContext.PlayerStateData.PersistentPlayerBases);
    const ships = data.BaseContext.PlayerStateData.ShipOwnership;
    const bases = data.BaseContext.PlayerStateData.PersistentPlayerBases;

    if (ships.length < 1) return;

    step.value = 1;

    ships.forEach((ship, index) => {
        if (ship.Resource.Filename !== 'MODELS/COMMON/SPACECRAFT/BIGGS/BIGGS.SCENE.MBIN') return;
    
        const base = bases.find(b => b.UserData === index);

        if (!base) return;
    
        listLocalCorvettes.value.push({
            ship,
            base
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
            data: corvette
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
}

</style>