import React, { useCallback, useContext, useMemo } from "react";
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
    const onPressBackup = useCallback(() => {
        push("Auth", { onSuccess: openDialog });
    }, []);
    const onPressCustomerSupport = useCallback(() => Linking.openURL(t("common:telegramUrl")), []);
    const onPressResetAccount = useCallback(() => push("ResetAccount"), []);
    const { Dialog, openDialog } = useBackupSeedPhraseDialog();
    const versionString = useMemo(() => app.expo.version + "." + app.expo.extra.pubVersion, []);
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
                <Item title={t("backupSeedPhrase")} iconName="note" onPress={onPressBackup} />
                <Item
                    title={t("resetAccount")}
                    description={t("resetAccount.description")}
                    iconType={"AntDesign"}
                    iconName={"warning"}
                    onPress={onPressResetAccount}
                />
                <Item title={t("appVersion")} description={versionString} numberOfLines={2} />
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
    numberOfLines?: number;
}

const Item = ({ title, description, iconType, iconName, onPress, numberOfLines = 1 }: ItemProps) => {
    return (
        <ListItem button={true} iconRight={true} style={{ height: 72 }} onPress={onPress}>
            <Body>
                <Text style={{ fontSize: 20 }}>{title}</Text>
                {description && (
                    <Text note={true} ellipsizeMode="middle" numberOfLines={numberOfLines}>
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
