import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import { Button, Text } from "native-base";
import { Spacing } from "../../constants/dimension";

const StartScreen = () => {
    const { push } = useNavigation();
    const onCreateWallet = useCallback(() => push("NewMnemonic"), []);
    const onImportWallet = useCallback(() => push("ImportMnemonic"), []);
    return (
        <View style={{ flex: 1 }}>
            <View style={styles.background}>
                <Image style={styles.backgroundImage} source={require("../../assets/main-bg.png")} fadeDuration={0} />
            </View>
            <View style={styles.content}>
                <Image
                    style={styles.icon}
                    resizeMode="contain"
                    source={require("../../assets/icon-light.png")}
                    fadeDuration={0}
                />
                <Image
                    style={styles.logo}
                    resizeMode="contain"
                    source={require("../../assets/logo-light.png")}
                    fadeDuration={0}
                />
                <CreateWalletButton onPress={onCreateWallet} />
                <ImportWalletButton onPress={onImportWallet} />
            </View>
        </View>
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
            light={true}
            rounded={true}
            bordered={true}
            style={styles.button}
            onPress={onPress}>
            <Text uppercase={false}>{t("importExistingWallet")}</Text>
        </Button>
    );
};

const styles = StyleSheet.create({
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: Spacing.normal
    },
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

StartScreen.navigationOptions = () => ({
    header: null
});

export default StartScreen;
