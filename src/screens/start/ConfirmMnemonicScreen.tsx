import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useNavigation, useNavigationParam } from "react-navigation-hooks";

import EthereumChain from "@alice-finance/alice.js/dist/chains/EthereumChain";
import LoomChain from "@alice-finance/alice.js/dist/chains/LoomChain";
import * as SecureStore from "expo-secure-store";
import { Button, Container, Text } from "native-base";
import CaptionText from "../../components/CaptionText";
import MnemonicInput from "../../components/MnemonicInput";
import Spinner from "../../components/Spinner";
import SubtitleText from "../../components/SubtitleText";
import preset from "../../styles/preset";
import { ethereumPrivateKeyFromMnemonic, loomPrivateKeyFromMnemonic } from "../../utils/crypto-utils";
import { mapAccounts } from "../../utils/loom-utils";

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
            const onSuccess = () => {
                setEncrypting(true);
                setTimeout(async () => {
                    try {
                        const ethereumPrivateKey = ethereumPrivateKeyFromMnemonic(mnemonic);
                        const loomPrivateKey = loomPrivateKeyFromMnemonic(mnemonic);
                        await SecureStore.setItemAsync("mnemonic", mnemonic);
                        await SecureStore.setItemAsync("ethereumPrivateKey", ethereumPrivateKey);
                        await SecureStore.setItemAsync("loomPrivateKey", loomPrivateKey);
                        const ethereumChain = new EthereumChain(ethereumPrivateKey, __DEV__);
                        const loomChain = new LoomChain(loomPrivateKey, __DEV__);
                        await mapAccounts(ethereumChain, loomChain);
                        push("Complete");
                    } finally {
                        setEncrypting(false);
                    }
                }, 100);
            };
            push("Auth", { needsRegistration: true, onSuccess });
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
