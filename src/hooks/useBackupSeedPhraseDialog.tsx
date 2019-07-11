import React, { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Clipboard, View } from "react-native";
import { Dialog, Portal } from "react-native-paper";

import { Button, Icon, Text } from "native-base";
import platform from "../../native-base-theme/variables/platform";
import MnemonicChip from "../components/MnemonicChip";
import { Spacing } from "../constants/dimension";
import { ChainContext } from "../contexts/ChainContext";
import SnackBar from "../utils/SnackBar";

const useBackupSeedPhraseDialog = () => {
    const { t } = useTranslation("profile");
    const { mnemonic } = useContext(ChainContext);
    const [dialogOpen, setDialogOpen] = useState(false);
    const openDialog = useCallback(() => setDialogOpen(true), []);
    const closeDialog = useCallback(() => setDialogOpen(false), []);
    const onOk = useCallback(() => {
        setDialogOpen(false);
        Clipboard.setString(mnemonic);
        SnackBar.success(t("seedPhraseCopiedToTheClipboard"));
    }, []);
    return {
        Dialog: (() => (
            <BackupSeedPhraseDialog visible={dialogOpen} onCancel={closeDialog} onOk={onOk} />
        )) as React.FunctionComponent,
        openDialog
    };
};

const BackupSeedPhraseDialog = ({ visible, onCancel, onOk }) => {
    const { t } = useTranslation("profile");
    const { mnemonic } = useContext(ChainContext);
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onCancel}>
                <Dialog.Content>
                    <View style={{ flexDirection: "row" }}>
                        <Icon type="AntDesign" name="warning" style={{ color: platform.brandDanger, fontSize: 28 }} />
                        <Text style={{ color: platform.brandDanger, marginLeft: Spacing.small, fontSize: 20 }}>
                            {t("common:warning")}
                        </Text>
                    </View>
                    <Text style={{ color: platform.brandDanger, marginVertical: Spacing.normal }}>
                        {t("backupSeedPhrase.warning")}
                    </Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                        {mnemonic.split(" ").map((word, index) => (
                            <MnemonicChip key={index} word={word} />
                        ))}
                    </View>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button rounded={true} transparent={true} onPress={onCancel}>
                        <Text>{t("common:cancel")}</Text>
                    </Button>
                    <Button rounded={true} transparent={true} onPress={onOk}>
                        <Text>{t("common:copy")}</Text>
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

export default useBackupSeedPhraseDialog;
