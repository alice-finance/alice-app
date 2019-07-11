import React, { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Clipboard, View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import { Linking } from "expo";
import { Body, Container, Icon, ListItem, Text } from "native-base";
import app from "../../../../app.json";
import TitleText from "../../../components/TitleText";
import { Spacing } from "../../../constants/dimension";
import { ChainContext } from "../../../contexts/ChainContext";
import useBackupSeedPhraseDialog from "../../../hooks/useBackupSeedPhraseDialog";
import SnackBar from "../../../utils/SnackBar";

const ProfileScreen = () => {
    const { t } = useTranslation(["profile", "common"]);
    const { push } = useNavigation();
    const { ethereumChain } = useContext(ChainContext);
    const onPressMyAddress = useCallback(() => {
        Clipboard.setString(ethereumChain!.getAddress().toLocalAddressString());
        SnackBar.success(t("addressCopiedToTheClipboard"));
    }, []);
    const onPressCustomerSupport = useCallback(() => Linking.openURL(t("common:telegramUrl")), []);
    const onPressResetAccount = useCallback(() => push("ResetAccount"), []);
    const { Dialog, openDialog } = useBackupSeedPhraseDialog();
    return (
        <Container>
            <View>
                <TitleText>{t("myProfile")}</TitleText>
                <Item
                    title={t("customerSupport")}
                    description={t("customerSupport.description")}
                    iconType="AntDesign"
                    iconName="customerservice"
                    onPress={onPressCustomerSupport}
                />
                <Item
                    title={t("myAddress")}
                    description={ethereumChain!.getAddress().toLocalAddressString()}
                    iconName="key"
                    onPress={onPressMyAddress}
                />
                <Item title={t("backupSeedPhrase")} iconName="note" onPress={openDialog} />
                <Item
                    title={t("resetAccount")}
                    description={t("resetAccount.description")}
                    iconType={"AntDesign"}
                    iconName={"warning"}
                    onPress={onPressResetAccount}
                />
                <Item title={t("appVersion")} description={app.expo.version + "." + app.expo.extra.pubVersion} />
            </View>
            <Dialog />
        </Container>
    );
};

interface ItemProps {
    title: string;
    description?: string;
    iconType?:
        | "AntDesign"
        | "Entypo"
        | "EvilIcons"
        | "Feather"
        | "FontAwesome"
        | "FontAwesome5"
        | "Foundation"
        | "Ionicons"
        | "MaterialCommunityIcons"
        | "MaterialIcons"
        | "Octicons"
        | "SimpleLineIcons"
        | "Zocial";
    iconName?: string;
    onPress?: () => void;
}

const Item = ({ title, description, iconType, iconName, onPress }: ItemProps) => {
    return (
        <ListItem button={true} iconRight={true} style={{ height: 72 }} onPress={onPress}>
            <Body>
                <Text style={{ fontSize: 20 }}>{title}</Text>
                {description && (
                    <Text note={true} ellipsizeMode="middle" numberOfLines={1}>
                        {description}
                    </Text>
                )}
            </Body>
            {iconName && (
                <Icon
                    type={iconType || "SimpleLineIcons"}
                    name={iconName}
                    style={{ color: "black", marginRight: Spacing.normal }}
                />
            )}
        </ListItem>
    );
};

export default ProfileScreen;
