// * Types
import type { NotificationTemplate, Notification, Group } from '~/types/stores/notification';

type NID = number | string;


export const useNotificationsStore = defineStore('notifications', () => {
    const _list = ref<Array<Notification>>([]);
    const _active = ref<boolean>(false);

    const _groups = ref<Record<string, Partial<Group>>>({});


    // * Getters
    const list = computed(() => _list.value.sort((a, b) => a.createdAt < b.createdAt ? 1 : -1));

    const isActive = computed(() => _active.value);

    const groups = computed(() => {
        const groups: Record<string, Partial<Group> & { list: Array<Notification> }> = {};

        for (const name in _groups.value) {
            groups[name] = {
                ..._groups.value[name],
                list: list.value.filter(notification => notification?.group === name).sort((a, b) => {
                    return a.createdAt < b.createdAt ? 1 : -1;
                })
            }
        }

        return groups;
    });


    // * Actions
    function getIndex(nid: NID) {
        return list.value.findIndex(notification => {
            return notification[typeof nid === 'number' ? 'id' : 'name'] === nid;
        });
    }

    function push(notification: Partial<NotificationTemplate>, hidden: boolean = false): Notification {
        const newNotification: Notification = {
            ...notification,
            id: _list.value.length,
            createdAt: Date.now(),
            hidden,

            remove() {
                remove(newNotification.id);
            },
            hide() {
                hide(newNotification.id);
            }
        }

        _list.value.push(newNotification);

        return newNotification;
    }

    function remove(...nids: Array<NID>) {
        for (const nid of nids) {
            const index = getIndex(nid);

            if (index < 0) continue;

            _list.value.splice(index, 1);
        }
    }

    function hide(...nids: Array<NID>) {
        for (const nid of nids) {
            const index = getIndex(nid);

            if (index < 0) continue;

            _list.value[index]!.hidden = true;
        }
    }

    function searchByName(name: string): Notification | null {
        const index = getIndex(name);

        if (index < 0) return null;

        return list.value[index]!;
    }

    return {
        list,
        isActive,
        groups,

        setActive(bool: boolean) {
            _active.value = bool;
        },
        push,
        has(nid: NID) {
            const index = getIndex(nid);

            return index > -1;
        },
        get(nid: NID) {
            const index = getIndex(nid);

            if (index < 0) return null;

            return list.value[index];
        },
        remove,
        hide,
        searchByName,

        createGroup(name: string, group: Partial<Omit<Group, 'updatedAt'>>) {
            _groups.value[name] = group;
        },
        hasGroup(name: string) {
            return _groups.value[name] !== undefined;
        }
    }
});