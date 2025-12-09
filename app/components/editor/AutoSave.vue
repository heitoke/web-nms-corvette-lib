<template>
    <UIDialog :open="isOpened">
        <h2>Auto-Save</h2>

        <p>This feature allows you to opt out of constantly downloading a file and downloading it to your device.</p>

        <p>What happens next if you agree to this feature?</p>

        <Point icon-text="1" text="You specify the file that will be used to import the corvettes that you want to add to your save. (The file you specified will be stored only on your device)"/>

        <UIButton @click="onSelectFile">
            <span>Select a save file (save*.hg)</span>
        </UIButton>

        <Point icon-text="2" text="Just click on the 'Apply' button below to enable this feature."/>

        <Point icon-text="3" text="On the page of the corvette that you want to add to your save, click the transfer corvette button, after receiving a notification that everything has been saved successfully, simply restart your save in the game and you're done."/>

        <p>If you are not ready for this feature, just close this window.</p>

        <UIButton style="float: right;"
            @click="onApplyAutoSave"
        >
            <span>Apply</span>
        </UIButton>
    </UIDialog>
</template>

<script lang="ts" setup>

import Point from '../Point.vue';

// * Stores
import { useNotificationsStore } from '~/stores/notifications';
import { useLocalSaveStore } from '~/stores/localSave';


const $notifications = useNotificationsStore();
const $localSave = useLocalSaveStore();


const isActived = ref(false);
const isOpened = ref(false);


let fileHandle: FileSystemFileHandle | null = null;

async function onSelectFile() {
    if ("showOpenFilePicker" in window) {
        try {
            // @ts-ignore
            const [localFileHandle] = await window.showOpenFilePicker({ multiple: false });

            fileHandle = localFileHandle
            return;
        } catch (e) {
            return;
        }
    }
}


function checkFileSystemAccessSupport() {
    const features = {
        showOpenFilePicker: 'showOpenFilePicker' in window,
        showSaveFilePicker: 'showSaveFilePicker' in window,
        showDirectoryPicker: 'showDirectoryPicker' in window,
        isFileSystemAccessAPISupported: 
            'showOpenFilePicker' in window && 
            'FileSystemFileHandle' in window &&
            'FileSystemWritableFileStream' in window
    };
    
    console.table(features);
    
    return features.showOpenFilePicker;
}


async function onApplyAutoSave() {
    if (!fileHandle) return;

    localStorage.setItem('isAutoSaved', 'true');

    await $localSave.setFileHandle(fileHandle);

    isOpened.value = false;
}

onMounted(async () => {
    const hasFSAApi = checkFileSystemAccessSupport();
    
    if (!hasFSAApi) return;

    isActived.value = Boolean(localStorage['isAutoSaved'] === 'true');

    if (localStorage['isAutoSaved'] !== 'true' && localStorage['isAutoSaved'] !== 'false') setTimeout(() => {
        const notification = $notifications.push({
            mode: 'fixed',
            title: 'Auto-save',
            text: 'Do you want to enable auto-save? To learn more, click on the button below.',
            buttons: [
                {
                    label: 'Learn more',
                    click: () => {
                        isOpened.value = true;
                        notification.remove();
                    }
                },
                {
                    label: 'Refuse',
                    click: () => {
                        notification.remove();
                        localStorage.setItem('isAutoSaved', 'false');
                    }
                }
            ]
        });
    }, 1000);
});

</script>