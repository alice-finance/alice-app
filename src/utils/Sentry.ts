import { SENTRY_DSN } from "react-native-dotenv";
import { SentrySeverity } from "react-native-sentry";

import Sentry from "sentry-expo";

const trackingTopics = {
    APP_START: "APP_START",
    ASSET_DEPOSITED: "ASSET_DEPOSITED",
    ASSET_WITHDRAWN: "ASSET_WITHDRAWN",
    SAVINGS_DEPOSITED: "SAVINGS_DEPOSITED",
    SAVINGS_WITHDRAWN: "SAVINGS_WITHDRAWN",
    ACCOUNT_MAPPED: "ACCOUNT_MAPPED",
    ALICE_CLAIMED: "ALICE_CLAIMED",
    ACCOUNT_RESET: "ACCOUNT_RESET",
    ASSET_TRANSFERRED: "ASSET_TRANSFERRED",
    IFO_MORE_INFO: "IFO_MORE_INFO",
    LEADERBOARD: "LEADERBOARD",
    START_SAVING: "START_SAVING",
    CREATE_WALLET: "CREATE_WALLET",
    IMPORT_WALLET: "IMPORT_WALLET",
    WALLET_CREATED: "WALLET_CREATED",
    WALLET_IMPORTED: "WALLET_IMPORTED",
    COPY_MNEMONIC: "COPY_MNEMONIC",
    MANAGE_ASSETS: "MANAGE_ASSETS"
};

const initialize = () => {
    if (SENTRY_DSN !== null) {
        Sentry.enableInExpoDevelopment = true;
        // noinspection JSIgnoredPromiseFromCall
        Sentry.config(SENTRY_DSN).install();
    }
};

const setTrackingInfo = (ethereumAddress: string, plasmaAddress: string) => {
    Sentry.setTagsContext({
        isDev: __DEV__
    });
    Sentry.setUserContext({
        id: ethereumAddress,
        extra: {
            ethereumAddress,
            plasmaAddress
        }
    });
};

const track = (topic: string, message?: string | object, data?: object) => {
    if (typeof message === "object") {
        data = message;
        message = "";
    } else if (typeof message === "undefined") {
        message = "";
        data = {};
    }
    Sentry.setTagsContext({ type: "TRACK" });
    Sentry.captureMessage(topic + (message === "" ? "" : ": " + message), {
        ...data,
        level: SentrySeverity.Info,
        type: "TRACK"
    });
};

const error = (err: Error, option?: object) => {
    Sentry.setTagsContext({ type: "ERROR" });
    Sentry.captureException(err, option);
};

export default {
    trackingTopics,
    initialize,
    setTrackingInfo,
    error,
    track,
    captureMessage: Sentry.captureMessage,
    captureBreadcrumb: Sentry.captureBreadcrumb
};
