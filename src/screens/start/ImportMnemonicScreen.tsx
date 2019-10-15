import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import EthereumChain from "@alice-finance/alice.js/dist/chains/EthereumChain";
import LoomChain from "@alice-finance/alice.js/dist/chains/LoomChain";
import { wordlists } from "bip39";
import * as SecureStore from "expo-secure-store";
import { Button, Container, Content, Text } from "native-base";
import MnemonicInput from "../../components/inputs/MnemonicInput";
import Spinner from "../../components/Spinner";
import CaptionText from "../../components/texts/CaptionText";
import SubtitleText from "../../components/texts/SubtitleText";
import useChainsInitializer from "../../hooks/useChainsInitializer";
import preset from "../../styles/preset";
import { ethereumPrivateKeyFromMnemonic, loomPrivateKeyFromMnemonic } from "../../utils/crypto-utils";
import { mapAccounts } from "../../utils/loom-utils";
import Sentry from "../../utils/Sentry";

const ImportMnemonicScreen = () => {
    const { t } = useTranslation(["start", "common"]);
    const { mnemonic, confirmed, encrypting, onChangeMnemonic, setEncrypting } = useImportMnemonicScreenEffect();
    const onStartEncrypting = () => setEncrypting(true);
    const onFinishEncrypting = () => setEncrypting(false);
    return (
        <Container>
            <Content>
                <SubtitleText aboveText={true}>{t("importSeedPhrase")}</SubtitleText>
                <CaptionText>{t("importSeedPhrase.description")}</CaptionText>
                <View style={preset.marginNormal}>
                    {encrypting ? (
                        <Spinner compact={true} label={t("common:encrypting")} />
                    ) : (
                        <View style={preset.marginSmall}>
                            <MnemonicInput onChangeMnemonic={onChangeMnemonic} style={preset.marginTopNormal} />
                            {confirmed && (
                                <NextButton
                                    mnemonic={mnemonic}
                                    onStartEncrypting={onStartEncrypting}
                                    onFinishEncrypting={onFinishEncrypting}
                                />
                            )}
                        </View>
                    )}
                </View>
            </Content>
        </Container>
    );
};

const NextButton = ({ mnemonic, onStartEncrypting, onFinishEncrypting }) => {
    const { t } = useTranslation("common");
    const { push } = useNavigation();
    const { initialize } = useChainsInitializer();
    const onPress = useCallback(async () => {
        const onSuccess = () => {
            onStartEncrypting();
            setTimeout(async () => {
                try {
                    await initialize(mnemonic);
                    Sentry.track(Sentry.trackingTopics.WALLET_IMPORTED);
                    push("Complete");
                } finally {
                    onFinishEncrypting();
                }
            }, 100);
        };
        push("Auth", { needsRegistration: true, onSuccess });
    }, [mnemonic]);
    return (
        <Button block={true} rounded={true} style={preset.marginTopNormal} onPress={onPress}>
            <Text>{t("next")}</Text>
        </Button>
    );
};

const useImportMnemonicScreenEffect = () => {
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
    return { mnemonic, confirmed, encrypting, onChangeMnemonic, setEncrypting };
};

export default ImportMnemonicScreen;
