import React, { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { AsyncStorage, View } from "react-native";
import { Dialog, Portal } from "react-native-paper";

import { SecureStore, Updates } from "expo";
import { Button, Icon, Text } from "native-base";
import platform from "../../native-base-theme/variables/platform";
import { Spacing } from "../constants/dimension";
import { ChainContext } from "../contexts/ChainContext";
import Sentry from "../utils/Sentry";

const useResetAccountDialog = () => {
    const { setMnemonic, setEthereumChain, setLoomChain } = useContext(ChainContext);
    const [dialogOpen, setDialogOpen] = useState(false);
    const openDialog = useCallback(() => setDialogOpen(true), []);
    const closeDialog = useCallback(() => setDialogOpen(false), []);
    const onOk = useCallback(async () => {
        await SecureStore.deleteItemAsync("mnemonic");
        setMnemonic("");
        await SecureStore.deleteItemAsync("ethereumPrivateKey");
        await SecureStore.deleteItemAsync("loomPrivateKey");
        await AsyncStorage.getAllKeys(async (error, keys) => {
            if (keys) {
                await AsyncStorage.multiRemove(keys);
            } else {
                // something's wrong! attempt to clear all
                await AsyncStorage.clear();
            }
        });
        Sentry.track(Sentry.trackingTopics.ACCOUNT_RESET);
        await Updates.reload();
        setEthereumChain(null);
        setLoomChain(null);
    }, []);
    return {
        Dialog: (() => (
            <ResetAccountDialog visible={dialogOpen} onCancel={closeDialog} onOk={onOk} />
        )) as React.FunctionComponent,
        openDialog
    };
};

const ResetAccountDialog = ({ visible, onCancel, onOk }) => {
    const { t } = useTranslation("profile");
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onCancel}>
                <Dialog.Content>
                    <View style={{ flexDirection: "row" }}>
                        <Icon type="AntDesign" name="warning" style={{ color: platform.brandDanger, fontSize: 28 }} />
                        <Text style={{ color: platform.brandDanger, marginLeft: Spacing.small, fontSize: 20 }}>
                            {t("resetAccount.description")}
                        </Text>
                    </View>
                    <Text style={{ color: platform.brandDanger, marginVertical: Spacing.normal }}>
                        {t("resetAccount.warning")}
                    </Text>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button rounded={true} transparent={true} onPress={onCancel}>
                        <Text>{t("common:cancel")}</Text>
                    </Button>
                    <Button rounded={true} transparent={true} onPress={onOk}>
                        <Text>{t("resetAccount.ok")}</Text>
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

export default useResetAccountDialog;
