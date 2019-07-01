import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { TextInput } from "react-native-paper";
import { useNavigation, useNavigationParam } from "react-navigation-hooks";

import * as SecureStore from "expo-secure-store";
import { Button, Container, Text } from "native-base";
import CaptionText from "../../components/CaptionText";
import Spinner from "../../components/Spinner";
import SubtitleText from "../../components/SubtitleText";
import Analytics from "../../helpers/Analytics";
import preset from "../../styles/preset";
import { ethereumPrivateKeyFromMnemonic, loomPrivateKeyFromMnemonic } from "../../utils/crypto-utils";

const ConfirmMnemonicScreen = () => {
    const { t } = useTranslation(["common", "start"]);
    const { push } = useNavigation();
    const mnemonic = useNavigationParam("mnemonic");
    const [confirmed, setConfirmed] = useState(false);
    const [encrypting, setEncrypting] = useState(false);
    const [userMnemonic, setUserMnemonic] = useState("");
    const onChangeMnemonic = useCallback(
        m => {
            m = m
                .toLowerCase()
                .replace(/\s\s+/g, " ")
                .replace(/[^a-z ]/, "");
            setUserMnemonic(m);
            setConfirmed(mnemonic === m.trim());
        },
        [mnemonic]
    );
    const onComplete = useCallback(async () => {
        if (confirmed) {
            setEncrypting(true);
            try {
                await SecureStore.setItemAsync("mnemonic", mnemonic);
                await SecureStore.setItemAsync("ethereumPrivateKey", ethereumPrivateKeyFromMnemonic(mnemonic));
                await SecureStore.setItemAsync("loomPrivateKey", loomPrivateKeyFromMnemonic(mnemonic));
                Analytics.track(Analytics.events.KEY_CREATED);
                push("Complete");
            } finally {
                setEncrypting(false);
            }
        }
    }, [confirmed, mnemonic]);
    return (
        <Container>
            <SubtitleText aboveText={true}>{t("start:confirmSeedPhrase")}</SubtitleText>
            <CaptionText>{t("start:confirmSeedPhrase.description")}</CaptionText>
            <View style={preset.marginNormal}>
                {encrypting ? (
                    <Spinner compact={true} label={t("common:encrypting")} />
                ) : (
                    <>
                        <TextInput
                            mode="outlined"
                            multiline={true}
                            numberOfLines={0}
                            placeholder={t("seedPhrase")}
                            autoCapitalize="none"
                            autoCorrect={false}
                            onChangeText={onChangeMnemonic}
                            style={preset.marginTopNormal}
                            value={userMnemonic}
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
                            <Text>{t("next")}</Text>
                        </Button>
                    </>
                )}
            </View>
        </Container>
    );
};

export default ConfirmMnemonicScreen;
