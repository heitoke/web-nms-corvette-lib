<template>
    <main class="home">
        <!-- <div class="background-media">
            <iframe src="https://player.vimeo.com/video/1113551383?autoplay=1&amp;background=1&amp;loop=1&amp;autopause=0" frameborder="0" webkitallowfullscreen="" mozallowfullscreen="" allowfullscreen="allowfullscreen"></iframe>
        </div> -->

        <div class="content">
            <h1>No Man's Sky Corvettes</h1>

            <p>Welcome! This site was created so that we could share our corvettes from our favorite game, No Man's Sky, and exchange experiences.</p>
        
            <NuxtLink to="/corvettes">
                <UIButton>
                    <span>List Corvettes</span>
                </UIButton>
            </NuxtLink>
        </div>
    </main>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>

.page.home {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #000;

    .background-media {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        background-color: #000000;
        overflow: hidden;
        z-index: 1;

        &::before {
            content: "";
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            background-color: #00000055;
            z-index: 2;
        }

        iframe {
            width: 100vw;
            height: 120%;
            position: absolute;
            top: -64px;
            left: 0;
            // right: 0;
            object-fit: contain;
            -o-object-fit: contain;
        }
    }

    .content {
        max-width: 512px;
        position: relative;
        color: #fff;
        font-family: 'GeosansLightNMS', Helvetica, Arial, sans-serif;
        font-weight: 100;
        text-align: center;
        z-index: 1;

        h1 {
            margin: 0;
            padding: 0;
            font-weight: 100;
            font-size: 64px;
        }
    }
}

</style>