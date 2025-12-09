<template>
    <Header/>

    <ClientOnly>
        <Notifications/>
        <AutoSave/>
    </ClientOnly>

    <NuxtPage class="page"/>

    <UIDialog :open="!isReadIt" :close-on-click-outside="false">
        <div class="alert-user-notice">
            <h2>User Notice</h2>
        
            <p>This web resource is intended for the No Man's Sky player community and serves exclusively for publishing, sharing, and viewing screenshots and descriptions of <b>Corvette-class starships.</b></p>
        
            <p>By using this site, you agree to the following terms:</p>
        
            <h3>1. Content Moderation</h3>
        
            <ul>
                <li>
                    <p>Published materials (corvettes) must be relevant to the community's theme.</p>
                </li>
                <li>
                    <p>The administration reserves the right to <b>remove any content</b> without prior notice upon receipt of substantiated complaints from other users, or if the content violates community rules, contains offensive, prohibited, or irrelevant elements.</p>
                </li>
            </ul>
        
            <h3>2. Security, Integrity, and Open Source</h3>
        
            <ul>
                <li>
                    <p>Any attempts to intentionally disrupt the site's operation (including, but not limited to: DDoS attacks, vulnerability exploitation, malware injection) are strictly prohibited.</p>
                </li>
                <li>
                    <p>This is an open-source project. Its source code is available for viewing and audit at: <a href="https://github.com/heitoke/web-nms-corvette-lib">https://github.com/heitoke/web-nms-corvette-lib</a>. We welcome responsible disclosure of any discovered vulnerabilities via GitHub mechanisms (Issues, Pull Requests). If you find a technical flaw, <b>please report it responsibly to the administration.</b></p>
                </li>
            </ul>
        
            <h3>3. Privacy and Data Collection Guarantees</h3>
            
            <p>For your peace of mind, we openly state our data policy:</p>
        
            <ul>
                <li>
                    <p><b>We do not collect or store</b> your personal data without your explicit consent.</p>
                </li>
                <li>
                    <p><b>The only information</b> stored on our servers consists of the corvette screenshots and descriptions you upload.</p>
                </li>
                <li>
                    <p>For authorization, we use exclusively the <b>OAuth 2.0 protocol. Only the following providers are supported: Google and GitHub. We do not have access to and do not store your passwords</b> for these services. The server retains only the <b>identification tokens</b> necessary for the authorization system to function, in accordance with OAuth security standards.</p>
                </li>
                <li>
                    <p>We do not transfer data to third parties or use it for commercial or advertising purposes.</p>
                </li>
            </ul>
        
            <h3>4. User Responsibility</h3>
            
            <p>By publishing content, you confirm that you are its author or have the right to distribute it.</p>
        
            <p>The site administration makes every effort to maintain its operation, security, and a friendly atmosphere. We strive for maximum transparency, as evidenced by the project's open-source nature. Thank you for being part of our community!</p>
        
            <p><i>Last updated: December 7, 2025.</i></p>
        
            <UIButton @click="onClickIReadIt">I read it!</UIButton>
        </div>
    </UIDialog>
</template>

<script lang="ts" setup>

import Header from '~/components/header/Index.vue';
import Notifications from '~/components/notifications/Index.vue';
import AutoSave from './components/editor/AutoSave.vue';


const isReadIt = ref(true);


function onClickIReadIt() {
    isReadIt.value = true;

    localStorage.setItem('iReadIt', 'true');
}


onMounted(() => {
    isReadIt.value = Boolean(localStorage['iReadIt']);
});

</script>

<style lang="scss">

.page {
    padding-top: 64px;
    padding-left: 20%;
    padding-right: 20%;
    padding-bottom: 64px;
    width: 100vw;
    height: 100vh;
    position: relative;
    transition: opacity .5s, transform .5s;
    overflow-x: hidden;
    box-sizing: border-box;
}

.alert-user-notice {
    max-width: clamp(315px, 50vw, 1280px) !important;
    max-height: 90vh;

    h2, h3 {
        margin: 0;
        padding: 0;
    }

    p {
        margin: 8px 0px;
    }

    b {
        font-weight: 600;
    }

    a {
        color: orange;
        text-decoration: underline;
    }

    ul {
        li {
            list-style-type: disc;
        }
    }

    ul {
        list-style-type: disc;
        padding-left: 20px;
        padding-right: 30px;
        margin: 1em 0;
    }

    .ui-button {
        float: right;
    }
}

.fade-enter-active,
.fade-leave-active {
    transform: translateY(-64px);
    opacity: 0;
}


@media (max-width: 1280px) {
    .page {
        padding: 12px 12px 32px 12px;
    }
}

</style>