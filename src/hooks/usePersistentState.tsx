import { useCallback, useState } from "react";
import { AsyncStorage } from "react-native";

import useAsyncEffect from "./useAsyncEffect";

const usePersistentState = <T extends {}>(key: string, initialState: any) => {
    const [state, setState] = useState<T>(initialState as T);
    useAsyncEffect(async () => {
        const value = await AsyncStorage.getItem(key);
        setTimeout(() => {
            setState(value === null ? initialState : JSON.parse(value));
        }, 0);
    }, []);
    const setPersistentState = useCallback(async newState => {
        try {
            const stateToStore = newState instanceof Function ? newState(state) : newState;
            await AsyncStorage.setItem(key, JSON.stringify(stateToStore));
            setTimeout(() => {
                setState(stateToStore);
            }, 0);
        } catch (error) {}
    }, []);
    return [state, setPersistentState];
};

export default usePersistentState;
