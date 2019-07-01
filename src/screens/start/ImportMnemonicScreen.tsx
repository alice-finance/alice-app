import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { TextInput } from "react-native-paper";
import { useNavigation } from "react-navigation-hooks";

import { wordlists } from "bip39";
import * as SecureStore from "expo-secure-store";
import { Button, Container, Text } from "native-base";
import CaptionText from "../../components/CaptionText";
import Spinner from "../../components/Spinner";
import SubtitleText from "../../components/SubtitleText";
import Analytics from "../../helpers/Analytics";
import preset from "../../styles/preset";
import { ethereumPrivateKeyFromMnemonic, loomPrivateKeyFromMnemonic } from "../../utils/crypto-utils";

const ImportMnemonicScreen = () => {
    const { t } = useTranslation(["start", "common"]);
    const { push } = useNavigation();
    const [confirmed, setConfirmed] = useState(false);
    const [encrypting, setEncrypting] = useState(false);
    const [mnemonic, setMnemonic] = useState("");
    const onChangeMnemonic = useCallback(
        newMnemonic => {
            const words = newMnemonic.trim().split(" ");
            setConfirmed(words.length === 12 && words.every(word => wordlists.english.includes(word)));
            setMnemonic(newMnemonic);
        },
        [wordlists]
    );
    const onComplete = useCallback(async () => {
        if (confirmed) {
            setEncrypting(true);
            try {
                await SecureStore.setItemAsync("mnemonic", mnemonic);
                await SecureStore.setItemAsync("ethereumPrivateKey", ethereumPrivateKeyFromMnemonic(mnemonic));
                await SecureStore.setItemAsync("loomPrivateKey", loomPrivateKeyFromMnemonic(mnemonic));
                Analytics.track(Analytics.events.KEY_IMPORTED);
                push("Complete");
            } finally {
                setEncrypting(false);
            }
        }
    }, [mnemonic]);
    return (
        <Container>
            <SubtitleText aboveText={true}>{t("importSeedPhrase")}</SubtitleText>
            <CaptionText>{t("importSeedPhrase.description")}</CaptionText>
            <View style={preset.marginNormal}>
                {encrypting ? (
                    <Spinner compact={true} label={t("common:encrypting")} />
                ) : (
                    <>
                        <TextInput
                            mode="outlined"
                            multiline={true}
                            numberOfLines={0}
                            placeholder={t("common:seedPhrase")}
                            autoCapitalize="none"
                            autoCorrect={false}
                            onChangeText={onChangeMnemonic}
                            style={preset.marginTopNormal}
                        />
                        <CaptionText style={[preset.marginTopNormal, { marginHorizontal: 0, fontSize: 16 }]}>
                            {t("start:inputSeedPhraseNotice")}
                        </CaptionText>
                        <Button
                            block={true}
                            rounded={true}
                            disabled={!confirmed}
                            style={preset.marginTopNormal}
                            onPress={onComplete}>
                            <Text>{t("common:next")}</Text>
                        </Button>
                    </>
                )}
            </View>
        </Container>
    );
};

export default ImportMnemonicScreen;
