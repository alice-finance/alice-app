import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Alert, NetInfo } from "react-native";

import { Updates } from "expo";

interface UpdateCheckOption {
    alertOnError?: boolean;
    onlyOnWifi?: boolean;
}

const useUpdateChecker = () => {
    const { t } = useTranslation("update");

    const startUpdate = useCallback(() => {
        Updates.fetchUpdateAsync().then(() => {
            Updates.reloadFromCache();
        });
    }, []);

    const proceedCheck = useCallback(
        (options: UpdateCheckOption) => {
            Updates.checkForUpdateAsync()
                .then(updateInfo => {
                    if (updateInfo && updateInfo.hasOwnProperty("isAvailable")) {
                        if (updateInfo.isAvailable) {
                            Alert.alert(
                                t("title"),
                                t("description"),
                                [
                                    {
                                        text: t("start"),
                                        onPress: () => {
                                            startUpdate();
                                        }
                                    }
                                ],
                                {
                                    cancelable: false
                                }
                            );
                        } else if (options.alertOnError) {
                            Alert.alert(t("latestVersion"));
                        }
                    } else if (options.alertOnError) {
                        Alert.alert(t("error"), t("fetchInfoError"));
                    }
                })
                .catch(error => {
                    if (options.alertOnError) {
                        Alert.alert(t("error"), error);
                    }
                });
        },
        [startUpdate]
    );

    const checkForUpdate = useCallback(
        (options: UpdateCheckOption = { alertOnError: false, onlyOnWifi: false }) => {
            if (options.onlyOnWifi) {
                NetInfo.getConnectionInfo().then(connectionInfo => {
                    if (connectionInfo.type === "wifi") {
                        proceedCheck(options);
                    }
                });
            } else {
                proceedCheck(options);
            }
        },
        [proceedCheck, startUpdate]
    );

    return { checkForUpdate };
};

export default useUpdateChecker;
