import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { TextInput } from "react-native-paper";
import { useNavigation } from "react-navigation-hooks";

import { wordlists } from "bip39";
import { SecureStore } from "expo";
import { Button, Container, Text } from "native-base";
import CaptionText from "../../components/CaptionText";
import SubtitleText from "../../components/SubtitleText";
import { Spacing } from "../../constants/dimension";

const ImportMnemonicScreen = () => {
    const { t } = useTranslation(["start", "common"]);
    const { push } = useNavigation();
    const [confirmed, setConfirmed] = useState(false);
    const [mnemonic, setMnemonic] = useState("");
    const onChangeMnemonic = useCallback(
        newMnemonic => {
            const words = newMnemonic.trim().split(" ");
            setConfirmed(words.length === 12 && words.every(word => wordlists.english.includes(word)));
            setMnemonic(newMnemonic);
        },
        [wordlists]
    );
    const onComplete = useCallback(() => {
        if (confirmed) {
            SecureStore.setItemAsync("mnemonic", mnemonic).then(() => push("Complete"));
        }
    }, [mnemonic]);
    return (
        <Container style={{ flex: 1 }}>
            <SubtitleText aboveText={true}>{t("importSeedPhrase")}</SubtitleText>
            <CaptionText>{t("importSeedPhrase.description")}</CaptionText>
            <View style={{ flex: 1, margin: Spacing.normal }}>
                <TextInput
                    mode="outlined"
                    multiline={true}
                    numberOfLines={0}
                    placeholder={t("common:seedPhrase")}
                    onChangeText={onChangeMnemonic}
                    style={{ marginTop: Spacing.normal }}
                />
                <Button block={true} disabled={!confirmed} style={{ marginTop: Spacing.normal }} onPress={onComplete}>
                    <Text>{t("common:next")}</Text>
                </Button>
            </View>
        </Container>
    );
};

export default ImportMnemonicScreen;
