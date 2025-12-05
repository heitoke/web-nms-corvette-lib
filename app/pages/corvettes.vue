<template>
    <main class="corvettes">
        <div class="list">
            <ul>
                <NuxtLink v-for="(corvette, idx) of corvettes" :key="idx"
                    :to="`/c/${corvette.id}`"
                >
                    <li>
                        <span>{{ corvette.name }}</span>
                    </li>
                </NuxtLink>

                <NuxtLink to="/upload">
                    <li class="add">
                        <span>Add corvette :)</span>
                    </li>
                </NuxtLink>
            </ul>
        </div>
    </main>
</template>

<script lang="ts" setup>

// * Types
import type { ShipOwnership, PersistentPlayerBase } from '~~/types/editor/save';


const $user = useSupabaseUser();


const corvettes = ref<Array<{ id: number, name: string, description?: string, created_at: number }>>([]);


async function fetchListCorvettes() {
    const data = await $fetch('/api/corvettes');

    corvettes.value = data;
}


onMounted(() => {
    fetchListCorvettes();
})

</script>

<style lang="scss" scoped>

.page.corvettes {
    background-color: #000;

    .list ul {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 12px;

        li {
            cursor: pointer;
            padding: 10px 14px;
            background-color: #ffffff25;
        }
    }
}

</style>