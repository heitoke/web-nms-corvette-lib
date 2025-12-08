<template>
    <main class="home">
        <div class="background">
            <video id="video-bg" preload="auto" autoplay loop muted playsinline>
                <source src="~/assets/background_voyagers.mp4" type="video/mp4">
                <source src="~/assets/background_voyagers.webm" type="video/webm">
            </video>
        </div>

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

<script lang="ts" setup>


function initVideo() {
    const videoElement = document?.querySelector('.page.home video') as HTMLVideoElement;

    if (!videoElement) return;
    
    videoElement.volume = 0;

    videoElement.play().catch(err => {
        console.log(`Error video play`, err);
    });

    videoElement.controls = false;
    videoElement.removeAttribute('controls');
}

onMounted(() => {
    initVideo();
});

</script>

<style lang="scss" scoped>

.page.home {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #000;

    .background {
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

        video {
            width: 100%;
            object-fit: cover;
            object-position: center;
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