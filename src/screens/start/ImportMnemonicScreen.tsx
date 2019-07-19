import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import EthereumChain from "@alice-finance/alice.js/dist/chains/EthereumChain";
import LoomChain from "@alice-finance/alice.js/dist/chains/LoomChain";
import { wordlists } from "bip39";
import * as SecureStore from "expo-secure-store";
import { Button, Container, Text } from "native-base";
import CaptionText from "../../components/CaptionText";
import MnemonicInput from "../../components/MnemonicInput";
import Spinner from "../../components/Spinner";
import SubtitleText from "../../components/SubtitleText";
import Analytics from "../../helpers/Analytics";
import preset from "../../styles/preset";
import { ethereumPrivateKeyFromMnemonic, loomPrivateKeyFromMnemonic } from "../../utils/crypto-utils";
import { mapAccounts } from "../../utils/loom-utils";

const ImportMnemonicScreen = () => {
    const { t } = useTranslation(["start", "common"]);
    const { push } = useNavigation();
    const [confirmed, setConfirmed] = useState(false);
    const [encrypting, setEncrypting] = useState(false);
    const [mnemonic, setMnemonic] = useState("");

    const onChangeMnemonic = useCallback(
        newMnemonic => {
            const words = newMnemonic.split(" ");
            setConfirmed(words.length === 12 && words.every(word => wordlists.english.includes(word)));
            setMnemonic(newMnemonic.trim());
        },
        [wordlists]
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
                        Analytics.track(Analytics.events.KEY_IMPORTED);
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
            <SubtitleText aboveText={true}>{t("importSeedPhrase")}</SubtitleText>
            <CaptionText>{t("importSeedPhrase.description")}</CaptionText>
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
                                <Text>{t("common:next")}</Text>
                            </Button>
                        )}
                    </View>
                )}
            </View>
        </Container>
    );
};

export default ImportMnemonicScreen;
