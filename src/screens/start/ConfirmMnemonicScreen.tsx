import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { TextInput } from "react-native-paper";
import { useNavigation, useNavigationParam } from "react-navigation-hooks";

import { SecureStore } from "expo";
import { Button, Container, Text } from "native-base";
import CaptionText from "../../components/CaptionText";
import SubtitleText from "../../components/SubtitleText";
import { Spacing } from "../../constants/dimension";

const ConfirmMnemonicScreen = () => {
    const { t } = useTranslation(["common", "start"]);
    const { push } = useNavigation();
    const mnemonic = useNavigationParam("mnemonic");
    const [confirmed, setConfirmed] = useState(false);
    const onChangeMnemonic = useCallback(
        m => {
            setConfirmed(mnemonic === m.trim());
        },
        [mnemonic]
    );
    const onComplete = useCallback(async () => {
        if (confirmed) {
            await SecureStore.setItemAsync("mnemonic", mnemonic);
            push("Complete");
        }
    }, [confirmed, mnemonic]);
    return (
        <Container style={styles.container}>
            <SubtitleText aboveText={true}>{t("start:confirmSeedPhrase")}</SubtitleText>
            <CaptionText>{t("start:confirmSeedPhrase.description")}</CaptionText>
            <View style={styles.content}>
                <TextInput
                    mode="outlined"
                    multiline={true}
                    numberOfLines={0}
                    placeholder={t("seedPhrase")}
                    onChangeText={onChangeMnemonic}
                    style={styles.input}
                />
                <Button block={true} disabled={!confirmed} style={styles.button} onPress={onComplete}>
                    <Text>{t("next")}</Text>
                </Button>
            </View>
        </Container>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, margin: Spacing.normal },
    input: { marginTop: Spacing.normal },
    button: { marginTop: Spacing.normal }
});

export default ConfirmMnemonicScreen;
