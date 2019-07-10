import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useNavigation, useNavigationParam } from "react-navigation-hooks";

import * as SecureStore from "expo-secure-store";
import { Button, Container, Text } from "native-base";
import CaptionText from "../../components/CaptionText";
import MnemonicInput from "../../components/MnemonicInput";
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
    const onChangeMnemonic = useCallback(
        newMnemonic => {
            setConfirmed(mnemonic === newMnemonic);
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
                    <View style={preset.marginSmall}>
                        <MnemonicInput onChangeMnemonic={onChangeMnemonic} style={preset.marginTopNormal} />
                        {confirmed && (
                            <Button
                                block={true}
                                rounded={true}
                                disabled={!confirmed}
                                style={preset.marginTopNormal}
                                onPress={onComplete}>
                                <Text>{t("next")}</Text>
                            </Button>
                        )}
                    </View>
                )}
            </View>
        </Container>
    );
};

export default ConfirmMnemonicScreen;
