import { SENTRY_DSN } from "react-native-dotenv";
import { SentrySeverity } from "react-native-sentry";

import Sentry from "sentry-expo";

const initialize = () => {
    if (SENTRY_DSN !== null) {
        Sentry.enableInExpoDevelopment = true;
        // noinspection JSIgnoredPromiseFromCall
        Sentry.config(SENTRY_DSN).install();
    }
};

const setTrackingInfo = (ethereumAddress: string, plasmaAddress: string) => {
    Sentry.setUserContext({
        extra: {
            ethereumAddress,
            plasmaAddress
        }
    });
};

const track = (message: string, data?: object) => {
    Sentry.captureMessage(message, { ...data, level: SentrySeverity.Info, type: "TRACK" });
};

const error = (err: Error, option?: object) => {
    Sentry.captureException(err, option);
};

export default {
    initialize,
    setTrackingInfo,
    error,
    track,
    captureMessage: Sentry.captureMessage,
    captureBreadcrumb: Sentry.captureBreadcrumb
};
