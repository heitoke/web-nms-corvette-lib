<template>
    <label class="ui-file">
        <div class="fake-btn">Choose file</div>
        <span class="file-msg">or drag and drop file here</span>

        <input type="file"
            :name="name"
            id="nms-save"
            :accept="accept"
            :multiple="multiple"
            
            @input="onInputFiles($event as any)"
        >
    </label>
</template>

<script lang="ts" setup>

const $emit = defineEmits({
    upload(data: FileList) {
        return data;
    }
});


const props = defineProps<{
    name?: string;
    accept: string;
    multiple?: boolean;
}>();


async function onInputFiles(event: InputEvent & { target: HTMLInputElement }) {
    const files = (event.target as HTMLInputElement).files;

    if (!files?.length) return;

    try {
        const container = event.target.parentElement!;
        container.classList.add('active');

        const msg = container?.querySelector('.file-msg')!;

        msg.textContent = `${files[0]?.name} ${files?.length > 1 ? `+ ${files?.length - 1} files` : ''}`;

        $emit('upload', files);
    } catch (error) {
        console.error(error);
    }
}

</script>

<style lang="scss" scoped>

.ui-file {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 100%;
    padding: 24px;
    border: 1px dashed #ffffff25;
    box-sizing: border-box;
    transition: 0.2s;

    &:hover,
    &.active {
        border: 1px solid #fff;

        .fake-btn {
            border: 1px solid #fff;
            background-color: #ffffff25;
        }
    }

    .fake-btn {
        flex-shrink: 0;
        background-color: #ffffff15;
        border: 1px dashed #ffffff25;
        padding: 8px 15px;
        margin-right: 10px;
        font-size: 12px;
        text-transform: uppercase;
        transition: .2s;
    }

    .file-msg {
        font-weight: 300;
        line-height: 1.4;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    input {
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 100%;
        cursor: pointer;
        opacity: 0;
        &:focus {
            outline: none;
        }
    }
}

</style>