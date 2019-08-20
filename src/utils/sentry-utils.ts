import { SENTRY_DSN } from "react-native-dotenv";

import Sentry from "sentry-expo";

const initialize = () => {
    if (SENTRY_DSN !== null) {
        Sentry.config(SENTRY_DSN).install();
    }
};

const setContext = (ethereumAddress: string, plasmaAddress: string) => {
    Sentry.setExtraContext({
        ethereumAddress,
        plasmaAddress
    });
};

export default {
    initialize,
    setContext,
    captureException: Sentry.captureException,
    captureMessage: Sentry.captureMessage,
    captureBreadcrumb: Sentry.captureBreadcrumb
};
