<template>
    <main class="corvettes">
        <header>
            <h2>List of corvettes</h2>
        </header>

        <div class="bar">
            <UIInput
                placeholder="Search corvette"
            
                @update:model-value="onUpdateText"
            />

            <NuxtLink to="upload" v-if="$user">
                <UIButton>
                    <span>Upload corvette</span>
                </UIButton>
            </NuxtLink>
        </div>

        <div class="loading" v-if="loading">
            <span>Please wait for the data to be uploaded...</span>
        </div>

        <div class="list" v-else-if="!loading && listCorvettes?.length > 0">
            <ul>
                <NuxtLink v-for="(corvette, idx) of listCorvettes" :key="idx"
                    :to="`/c/${corvette.id}`"
                >
                    <li>
                        <div class="banner">
                            <Slider :items="corvette?.images" v-if="corvette?.images?.length > 0">
                                <template #item="{ item, index }">
                                    <img :src="item?.url" alt="Corvette Image"></img>
                                </template>
                            </Slider>

                            <div class="no-images" v-else></div>
                        </div>

                        <div class="details">
                            <div class="name">{{ corvette?.name }}</div>
                            <div class="description">{{ corvette?.description }}</div>
                        </div>
                    </li>
                </NuxtLink>
            </ul>
        </div>

        <div class="void" v-else>
            <span>So far, no one has decided to load their corvettes ☠️</span>
        </div>
    </main>
</template>

<script lang="ts" setup>

import Slider from '~/components/Slider.vue';


const $user = useSupabaseUser();


const text = ref('');
const loading = ref(false);
const corvettes = ref<Array<{ id: number, name: string, description?: string, images: Array<string>, created_at: number }>>([]);


const listCorvettes = computed(() => {
    const regex = new RegExp(text.value.trim(), 'gi');

    return corvettes.value?.filter(c => {
        return regex.test(c?.name) || (c?.description && regex.test(c?.description));
    });
});


async function fetchListCorvettes() {
    loading.value = true;

    const data = await $fetch('/api/corvettes');

    loading.value = false;

    corvettes.value = data;
}


let timer: NodeJS.Timeout;

function onUpdateText(value: string) {
    clearTimeout(timer);

    timer = setTimeout(() => text.value = value, 500);
}


onMounted(() => {
    fetchListCorvettes();
});

</script>

<style lang="scss" scoped>

.page.corvettes {
    background-color: #000;

    header {
        h2 {
            font-family: 'GeosansLightNMS', Helvetica, Arial, sans-serif;
            text-transform: uppercase;
        }
    }

    .bar {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .list ul {
        display: grid;
        margin-top: 12px;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;

        li {
            cursor: pointer;
            position: relative;
            // padding: 10px 14px;
            border: 1px dashed #ffffff25;
            transition: .2s;

            &:hover {
                border: 1px solid #fff;

                .banner {
                    border-bottom: 1px solid #fff;

                    .slides {
                        img {
                            border: 0px solid #000;
                            transform: scale(1);
                        }
                    }
                }

                .details {
                    .name {
                        text-decoration: underline;
                    }
                }
            }

            .banner {
                max-width: 100%;
                height: 215px;
                max-height: 215px;
                position: relative;
                border-bottom: 1px dashed #ffffff25;
                overflow: hidden;

                .no-images {
                    width: 100%;
                    height: 100%;
                    background: #ffffff15;
                }

                img {
                    max-width: 100%;
                    width: 100%;
                    min-height: 215px;
                    height: 215px;
                    max-height: 215px;
                    border: 8px solid #000;
                    object-fit: cover;
                    object-position: center;
                    transition: .2s;
                    box-sizing: border-box;
                }
            }

            .details {
                padding: 8px;

                .name {
                    font-size: 18px;
                    font-family: 'GeosansLightNMS', Helvetica, Arial, sans-serif;
                    font-weight: 300;
                }

                .description {
                    margin-top: 4px;
                    font-size: 12px;
                    opacity: .7;
                }
            }
        }
    }

    .loading,
    .void {
        margin-top: 12px;
        padding: 24px;
        font-size: 18px;
        text-align: center;
        border: 1px dashed #ffffff25;
        font-family: 'GeosansLightNMS', Helvetica, Arial, sans-serif;
    }
}

</style>