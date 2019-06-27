import React, { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Clipboard, View } from "react-native";
import { Chip, Dialog, Portal } from "react-native-paper";

import { Linking } from "expo";
import { Body, Button, Container, Icon, ListItem, Text, Toast } from "native-base";
import app from "../../../../app.json";
import platform from "../../../../native-base-theme/variables/platform";
import TitleText from "../../../components/TitleText";
import { Spacing } from "../../../constants/dimension";
import { ChainContext } from "../../../contexts/ChainContext";

const ProfileScreen = () => {
    const { t } = useTranslation("profile");
    const { mnemonic } = useContext(ChainContext);
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
            <View>
                <TitleText>{t("myProfile")}</TitleText>
                <MyAddressItem />
                <Item title={t("backupSeedPhrase")} iconName="note" onPress={openDialog} />
                <CustomerSupportItem />
                <AppVersionItem />
            </View>
            <BackupSeedPhraseDialog visible={dialogOpen} onCancel={closeDialog} onOk={onOk} mnemonic={mnemonic} />
        </Container>
    );
};

const MyAddressItem = () => {
    const { t } = useTranslation("profile");
    const { ethereumChain } = useContext(ChainContext);
    const onPress = useCallback(() => {
        if (ethereumChain) {
            Clipboard.setString(ethereumChain.getAddress().toLocalAddressString());
            Toast.show({ text: t("addressCopiedToTheClipboard") });
        }
    }, [ethereumChain]);
    return (
        <ListItem iconRight={true} button={true} style={{ height: 72 }} onPress={onPress}>
            <Body>
                <Text style={{ fontSize: 20 }}>{t("myAddress")}</Text>
                <Text note={true} ellipsizeMode="middle" numberOfLines={1}>
                    {ethereumChain ? ethereumChain.getAddress().toLocalAddressString() : "0x"}
                </Text>
            </Body>
            <Icon type="SimpleLineIcons" name="key" style={{ color: "black", marginRight: Spacing.normal }} />
        </ListItem>
    );
};

const CustomerSupportItem = () => {
    const { t } = useTranslation(["profile", "common"]);
    const onPress = () => Linking.openURL(t("common:telegramUrl"));
    return (
        <ListItem iconRight={true} style={{ height: 72 }} onPress={onPress}>
            <Body>
                <Text style={{ fontSize: 20 }}>{t("customerSupport")}</Text>
                <Text note={true}>{t("customerSupport.description")}</Text>
            </Body>
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

export default ProfileScreen;
