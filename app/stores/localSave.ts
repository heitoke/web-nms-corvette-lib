import { defineStore } from 'pinia';

// * Types
import type { SaveTopLevel } from '~~/types/editor/save';


export const useLocalSaveStore = defineStore('localSave', () => {
    const _file = ref<File>();
    const _data = ref<SaveTopLevel>();

    const file = computed(() => _file.value);

    const data = computed(() => _data.value);


    function setFile(file: File) {
        _file.value = file;
    }

    function setData(data: SaveTopLevel) {
        _data.value = data;
    }

    function setCurrentTimeStamp() {
        if (!_data.value) return false;

        _data.value.BaseContext.PlayerStateData.TimeStamp = Math.floor(Date.now() / 1000);
    
        return true;
    }


    return {
        file,
        data,

        setFile,
        setData,
        setCurrentTimeStamp
    }
});