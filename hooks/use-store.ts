import { useLocalStorage } from 'usehooks-ts';

interface StoreData {
    _id: string;
    name: string;
    hostel: string;
    floor: string;
    userId: string;
}

export function useStore() {
    const [store, setStore, removeStore] = useLocalStorage<StoreData | null>('store', null);

    return { store, setStore, removeStore };
}
