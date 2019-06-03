import React, { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Clipboard, View } from "react-native";
import { Chip, Dialog } from "react-native-paper";

import { Body, Button, Container, Header, Icon, ListItem, Text, Toast } from "native-base";
import app from "../../../../app.json";
import platform from "../../../../native-base-theme/variables/platform";
import TitleText from "../../../components/TitleText";
import { Spacing } from "../../../constants/dimension";
import { WalletContext } from "../../../contexts/WalletContext";

const ProfileScreen = () => {
    const { t } = useTranslation("profile");
    const { mnemonic } = useContext(WalletContext);
    const [dialogOpen, setDialogOpen] = useState(false);
    const openDialog = useCallback(() => setDialogOpen(true), []);
    const closeDialog = useCallback(() => setDialogOpen(false), []);
    const onOk = useCallback(() => {
        setDialogOpen(false);
        Clipboard.setString(mnemonic);
        Toast.show({ text: t("seedPhraseCopiedToTheClipboard") });
    }, []);
    return (
        <Container>
            <Header noShadow={true} transparent={true} />
            <View>
                <TitleText>{t("myProfile")}</TitleText>
                <MyAddressItem />
                <Item title={t("backupSeedPhrase")} iconName="note" onPress={openDialog} />
                <AppVersionItem />
            </View>
            <BackupSeedPhraseDialog visible={dialogOpen} onCancel={closeDialog} onOk={onOk} mnemonic={mnemonic} />
        </Container>
    );
};

const MyAddressItem = () => {
    const { t } = useTranslation("profile");
    const { ethereumWallet } = useContext(WalletContext);
    const onPress = useCallback(() => {
        if (ethereumWallet) {
            Clipboard.setString(ethereumWallet.address.toLocalAddressString());
            Toast.show({ text: t("addressCopiedToTheClipboard") });
        }
    }, [ethereumWallet]);
    return (
        <ListItem iconRight={true} button={true} style={{ height: 72 }} onPress={onPress}>
            <Body>
                <Text style={{ fontSize: 20 }}>{t("myAddress")}</Text>
                <Text note={true} ellipsizeMode="middle" numberOfLines={1}>
                    {ethereumWallet ? ethereumWallet.address.toLocalAddressString() : "0x"}
                </Text>
            </Body>
            <Icon type="SimpleLineIcons" name="key" style={{ color: "black", marginRight: Spacing.normal }} />
        </ListItem>
    );
};

const AppVersionItem = () => {
    const { t } = useTranslation("profile");
    return (
        <ListItem iconRight={true} style={{ height: 72 }}>
            <Body>
                <Text style={{ fontSize: 20 }}>{t("appVersion")}</Text>
                <Text note={true}>{app.expo.version}</Text>
            </Body>
        </ListItem>
    );
};

const Item = ({ title, iconName, onPress }) => {
    return (
        <ListItem button={true} iconRight={true} style={{ height: 72 }} onPress={onPress}>
            <Body>
                <Text style={{ fontSize: 20 }}>{title}</Text>
            </Body>
            <Icon type="SimpleLineIcons" name={iconName} style={{ color: "black", marginRight: Spacing.normal }} />
        </ListItem>
    );
};

const BackupSeedPhraseDialog = ({ visible, onCancel, onOk, mnemonic }) => {
    const { t } = useTranslation(["profile", "common"]);
    return (
        <Dialog visible={visible} onDismiss={onCancel}>
            <Dialog.Content>
                <View style={{ flexDirection: "row" }}>
                    <Icon type="AntDesign" name="warning" style={{ color: platform.brandDanger, fontSize: 28 }} />
                    <Text style={{ color: platform.brandDanger, marginLeft: Spacing.small, fontSize: 20 }}>
                        {t("warning")}
                    </Text>
                </View>
                <Text style={{ color: platform.brandDanger, marginVertical: Spacing.normal }}>
                    {t("backupSeedPhrase.warning")}
                </Text>
                <View
                    style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        paddingHorizontal: 12
                    }}>
                    {mnemonic.split(" ").map((word, index) => (
                        <Chip mode="outlined" key={index} style={{ margin: Spacing.tiny }}>
                            {word}
                        </Chip>
                    ))}
                </View>
            </Dialog.Content>
            <Dialog.Actions>
                <Button primary={true} rounded={true} transparent={true} onPress={onCancel}>
                    <Text>{t("common:cancel")}</Text>
                </Button>
                <Button primary={true} rounded={true} transparent={true} onPress={onOk}>
                    <Text>{t("common:copy")}</Text>
                </Button>
            </Dialog.Actions>
        </Dialog>
    );
};

export default ProfileScreen;
