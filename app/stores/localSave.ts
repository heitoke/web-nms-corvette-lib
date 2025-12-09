import { defineStore } from 'pinia';

// * Types
import type { SaveTopLevel } from '~~/types/editor/save';


class DBSave {
    readonly dbName: string = 'NMS Corvettes';
    readonly dbVersion: number = 1;
    readonly storeName: string = 'saves';
    private db: IDBDatabase | null = null;

    constructor() {
        // this.init();
    }

    async init() {
        if (this.db) return this.db;

        const db = new Promise((res, rej) => {
            const req = indexedDB.open(this.dbName, this.dbVersion);

            req.onupgradeneeded = () => {
                const db = req.result;

                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'id' });
                }
            }

            req.onsuccess = () => res(req.result);
            req.onerror = () => {
                console.error(`IndexedDB Error`, req.error);
                return null;
            };
        }) as Promise<IDBDatabase | null>;

        this.db = await db;

        return this.db;
    }

    get(key: string) {
        if (!this.db) return null;
        return new Promise((res, rej) => {
            const tx = this.db?.transaction(this.storeName, 'readonly')!;
            const st = tx.objectStore(this.storeName);
            const rq = st.get(key);

            rq.onsuccess = () => res(rq.result ? rq.result.value : null);

            rq.onerror = () => rej(rq.error);
        });
    }

    put(key: string, value: any) {
        if (!this.db) return null;
        return new Promise((res, rej) => {
            try {
                const tx = this.db?.transaction(this.storeName, 'readwrite')!;
                const st = tx.objectStore(this.storeName);
                const rq = st.put({ id: key, value });

                rq.onsuccess = () => res(true);

                rq.onerror = () => rej(rq.error);
            } catch (error) {
                console.log(error)
            }
        });
    }
}

interface FileSave {
    name: string;
    handle: FileSystemFileHandle;
}


export const useLocalSaveStore = defineStore('localSave', () => {
    const _fileSave = ref<FileSave>();

    const _supportsWrite = ref(false);
    const _hasPermission = ref(false);

    const _content = ref();


    const $db = new DBSave();

    $db.init().then(async () => {
        const fileSave = await $db.get('fileSave') as FileSave || null;

        if (!fileSave) return;

        _fileSave.value = fileSave;

        const file = await fileSave?.handle?.getFile();
        const content = await file.text();

        _content.value = content;
    });


    async function loadFileSave() {
        return await $db.get('fileSave') as FileSave || null;
    }

    async function setFileSave(fileSave: FileSave) {
        return await $db.put('fileSave', fileSave);
    }

    async function setFileHandle(handle: FileSystemFileHandle) {
        _fileSave.value = {
            name: handle.name,
            handle
        }

        _supportsWrite.value = typeof handle.createWritable === "function";

        try {
            // @ts-ignore
            if (typeof handle.requestPermission === "function") {
                // @ts-ignore
                const p = await handle.requestPermission({
                    mode: _supportsWrite.value ? "readwrite" : "read"
                });

                _hasPermission.value = p === "granted";
            } else {
                _hasPermission.value = true;
            }
        } catch {
            _hasPermission.value = false;
        }

        try {
            const file = await handle.getFile();

            _content.value = await file.text();
        } catch (e) {}

        try {
            await setFileSave({ name: handle.name, handle: handle });
        } catch {
            // await setFileSave({ name: _fileSave.value?.name, handle: null });
        }
    }

    async function saveFileSave(content: any) {
        if (!_fileSave.value?.name && !_fileSave.value?.handle) return;

        try {
            // @ts-ignore
            if (typeof handle.requestPermission === "function") {
                // @ts-ignore
                const p = await handle.requestPermission({
                    mode: _supportsWrite.value ? "readwrite" : "read"
                });

                _hasPermission.value = p === "granted";
            } else {
                _hasPermission.value = true;
            }
        } catch {
            _hasPermission.value = false;
        }

        if (_fileSave.value.handle) {
            try {
                const writable = await _fileSave.value.handle.createWritable();

                await writable.write(content);
                await writable.close();

                return;
            } catch (e) {
                console.warn("handle write error", e);
            }
        }

        // const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(content);
        const a = document.createElement("a");
        a.href = url;
        a.download = _fileSave.value.name;
        a.click();
        URL.revokeObjectURL(url);
    }


    return {
        fileSave: computed(() => _fileSave.value),
        content: computed(() => _content.value),
        hasPermission: computed(() => _hasPermission.value),
        supportsWrite: computed(() => _supportsWrite.value),

        loadFileSave,
        setFileSave,
        setFileHandle,
        saveFileSave
    }
});