import React, { useCallback, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Clipboard } from "react-native";
import { useNavigation } from "react-navigation-hooks";
import { Linking } from "expo";
import { Body, Container, Content, Icon, ListItem, Text } from "native-base";
import app from "../../../../app.json";
import TitleText from "../../../components/texts/TitleText";
import ProfileIcon from "../../../components/ProfileIcon";
import { Spacing } from "../../../constants/dimension";
import { ChainContext } from "../../../contexts/ChainContext";
import useBackupSeedPhraseDialog from "../../../hooks/useBackupSeedPhraseDialog";
import SnackBar from "../../../utils/SnackBar";

const ProfileScreen = () => {
    const { t } = useTranslation(["profile", "common"]);
    const { isReadOnly } = useContext(ChainContext);
    return (
        <Container>
            <Content>
                <TitleText>{t("myProfile")}</TitleText>
                {isReadOnly && <CreateWalletItem />}
                {!isReadOnly && (
                    <>
                        <MyProfileIconItem />
                        <MyAddressItem />
                        <BackUpSeedPhraseItem />
                        <ResetAccountItem />
                    </>
                )}
                <CustomerSupportItem />
                <AppVersionItem />
            </Content>
        </Container>
    );
};

const CreateWalletItem = () => {
    const { t } = useTranslation(["profile", "common"]);
    const { push } = useNavigation();
    const onPressCreateWallet = useCallback(() => push("Start"), []);
    return (
        <Item
            title={t("createWallet")}
            description={t("createWallet.description")}
            iconType="AntDesign"
            iconName="wallet"
            onPress={onPressCreateWallet}
        />
    );
};

const CustomerSupportItem = () => {
    const { t } = useTranslation(["profile", "common"]);
    const onPressCustomerSupport = useCallback(() => Linking.openURL(t("common:telegramUrl")), []);
    return (
        <Item
            title={t("customerSupport")}
            description={t("customerSupport.description")}
            iconType="AntDesign"
            iconName="customerservice"
            onPress={onPressCustomerSupport}
        />
    );
};

const MyProfileIconItem = () => {
    const { loomChain } = useContext(ChainContext);
    const address = loomChain!.getAddress().toLocalAddressString();
    return <ProfileIcon address={address} width={120} height={120} style={{marginLeft: Spacing.normal}}/>;
};

const MyAddressItem = () => {
    const { t } = useTranslation(["profile", "common"]);
    const { ethereumChain } = useContext(ChainContext);
    const onPressMyAddress = useCallback(() => {
        Clipboard.setString(ethereumChain!.getAddress().toLocalAddressString());
        SnackBar.success(t("addressCopiedToTheClipboard"));
    }, []);
    return (
        <Item
            title={t("myAddress")}
            description={ethereumChain ? ethereumChain!.getAddress().toLocalAddressString() : ""}
            iconName="key"
            onPress={onPressMyAddress}
        />
    );
};

const BackUpSeedPhraseItem = () => {
    const { t } = useTranslation(["profile", "common"]);
    const { push } = useNavigation();
    const { Dialog, openDialog } = useBackupSeedPhraseDialog();
    const onPressBackup = useCallback(() => {
        push("Auth", { onSuccess: openDialog });
    }, []);
    return (
        <>
            <Item title={t("backupSeedPhrase")} iconName="note" onPress={onPressBackup} />
            <Dialog />
        </>
    );
};

const ResetAccountItem = () => {
    const { t } = useTranslation(["profile", "common"]);
    const { push } = useNavigation();
    const onPressResetAccount = useCallback(() => push("ResetAccount"), []);
    return (
        <Item
            title={t("resetAccount")}
            description={t("resetAccount.description")}
            iconType={"AntDesign"}
            iconName={"warning"}
            onPress={onPressResetAccount}
        />
    );
};

const AppVersionItem = () => {
    const { t } = useTranslation(["profile", "common"]);
    const versionString = useMemo(() => app.expo.version + "." + app.expo.extra.pubVersion, []);
    return <Item title={t("appVersion")} description={versionString} numberOfLines={2} />;
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
