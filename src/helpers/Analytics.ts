import { AMPLITUDE_API_KEY } from "react-native-dotenv";

import * as Amplitude from "expo-analytics-amplitude";

let isInitialized = false;

export const events = {
    ERROR: "ERROR",
    APP_START: "APP_START",
    KEY_IMPORTED: "KEY_IMPORTED",
    KEY_CREATED: "KEY_CREATED",
    ASSET_DEPOSITED: "ASSET_DEPOSITED",
    ASSET_WITHDRAWN: "ASSET_WITHDRAWN",
    SAVINGS_DEPOSITED: "SAVINGS_DEPOSITED",
    SAVINGS_WITHDRAWN: "SAVINGS_WITHDRAWN",
    ACCOUNT_MAPPED: "ACCOUNT_MAPPED"
};

export function initialize(): void {
    if (isInitialized || !AMPLITUDE_API_KEY) {
        return;
    }

    Amplitude.initialize(AMPLITUDE_API_KEY);
    isInitialized = true;
}

export function identify(id: string | null, options?: object) {
    initialize();

    if (isInitialized) {
        const properties = options;

        if (id) {
            Amplitude.setUserId(id);
            if (properties) {
                Amplitude.setUserProperties(properties);
            }
        } else {
            Amplitude.clearUserProperties();
        }
    }
}

export function track(event: string, options?: object): void {
    initialize();

    if (isInitialized) {
        const properties: { [k: string]: any } = options || {};
        properties.production = !__DEV__;

        if (properties) {
            Amplitude.logEventWithProperties(event, properties);
        } else {
            Amplitude.logEvent(event);
        }
    }
}

export default {
    events,
    initialize,
    identify,
    track
};
