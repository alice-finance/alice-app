import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import { Button, Container, Text } from "native-base";
import CaptionText from "../../components/CaptionText";
import SubtitleText from "../../components/SubtitleText";
import { Spacing } from "../../constants/dimension";
import preset from "../../styles/preset";

const StartScreen = () => {
    const { t } = useTranslation("start");
    const { push } = useNavigation();
    const onCreateWallet = useCallback(() => push("NewMnemonic"), []);
    const onImportWallet = useCallback(() => push("ImportMnemonic"), []);
    return (
        <Container>
            <SubtitleText aboveText={true}>{t("createYourWallet")}</SubtitleText>
            <CaptionText style={preset.marginBottomLarge}>{t("createYourWallet.description")}</CaptionText>
            <View style={preset.marginNormal}>
                <CreateWalletButton onPress={onCreateWallet} />
                <ImportWalletButton onPress={onImportWallet} />
            </View>
        </Container>
    );
};

const CreateWalletButton = ({ onPress }) => {
    const { t } = useTranslation("start");
    return (
        <Button block={true} large={true} primary={true} rounded={true} style={styles.button} onPress={onPress}>
            <Text uppercase={false} style={{ fontWeight: "bold" }}>
                {t("createNewWallet")}
            </Text>
        </Button>
    );
};

const ImportWalletButton = ({ onPress }) => {
    const { t } = useTranslation("start");
    return (
        <Button
            block={true}
            large={true}
            primary={true}
            rounded={true}
            bordered={true}
            style={styles.button}
            onPress={onPress}>
            <Text uppercase={false}>{t("importExistingWallet")}</Text>
        </Button>
    );
};

const styles = StyleSheet.create({
    icon: {
        width: 84,
        height: 84,
        marginBottom: Spacing.tiny
    },
    logo: {
        width: 140,
        height: 70,
        marginBottom: Spacing.huge
    },
    buttonIcon: {
        width: 24,
        height: 24
    },
    background: {
        position: "absolute",
        left: "-110%",
        bottom: "0%"
    },
    backgroundImage: {
        resizeMode: "contain"
    },
    button: { margin: Spacing.small }
});

export default StartScreen;
