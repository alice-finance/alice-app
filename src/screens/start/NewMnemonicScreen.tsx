import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Clipboard, StyleSheet, View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import { entropyToMnemonic } from "bip39";
import * as Random from "expo-random";
import { Button, Container, Content, Text } from "native-base";
import MnemonicChip from "../../components/MnemonicChip";
import Spinner from "../../components/Spinner";
import CaptionText from "../../components/texts/CaptionText";
import SubtitleText from "../../components/texts/SubtitleText";
import { Spacing } from "../../constants/dimension";
import preset from "../../styles/preset";
import Sentry from "../../utils/Sentry";
import SnackBar from "../../utils/SnackBar";

const NewMnemonicScreen = () => {
    const { t } = useTranslation(["common", "start", "profile"]);
    const { refreshing, mnemonic } = useNewMnemonicScreenEffect();
    return (
        <Container style={styles.container}>
            <Content>
                <SubtitleText aboveText={true}>{t("start:newSeedPhrase")}</SubtitleText>
                <CaptionText>{t("start:newSeedPhrase.description")}</CaptionText>
                <View style={styles.content}>
                    {refreshing ? (
                        <Spinner compact={true} label={t("common:generatingSeedPhrase")} />
                    ) : (
                        <View style={preset.marginNormal}>
                            <View style={styles.mnemonic}>
                                {mnemonic.split(" ").map((word, index) => (
                                    <MnemonicChip key={index} word={word} />
                                ))}
                            </View>
                            <CopyButton mnemonic={mnemonic} />
                            <NextButton mnemonic={mnemonic} disabled={refreshing} />
                        </View>
                    )}
                </View>
            </Content>
        </Container>
    );
};

const CopyButton = ({ mnemonic }) => {
    const { t } = useTranslation(["common", "profile"]);
    const onCopy = useCallback(() => {
        Sentry.track(Sentry.trackingTopics.COPY_MNEMONIC);
        Clipboard.setString(mnemonic);
        SnackBar.success(t("profile:seedPhraseCopiedToTheClipboard"));
    }, [mnemonic]);
    return (
        <Button block={true} rounded={true} transparent={true} onPress={onCopy} style={preset.marginTopNormal}>
            <Text>{t("common:copy")}</Text>
        </Button>
    );
};

const NextButton = ({ mnemonic, disabled }) => {
    const { t } = useTranslation("common");
    const { push } = useNavigation();
    const onPress = useCallback(() => {
        push("ConfirmMnemonic", { mnemonic });
    }, [mnemonic]);
    return (
        <Button
            primary={true}
            block={true}
            rounded={true}
            disabled={disabled}
            style={preset.marginTopSmall}
            onPress={onPress}>
            <Text>{t("next")}</Text>
        </Button>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, margin: Spacing.normal },
    mnemonic: {
        flexDirection: "row",
        flexWrap: "wrap"
    },
    chip: { margin: Spacing.tiny }
});

const useNewMnemonicScreenEffect = () => {
    const [refreshing, setRefreshing] = useState(true);
    const [mnemonic, setMnemonic] = useState<string>("");
    useEffect(() => {
        Random.getRandomBytesAsync(16).then(entropy => {
            if (entropy) {
                setMnemonic(entropyToMnemonic(Buffer.from(entropy)));
                setRefreshing(false);
            }
        });
    }, []);
    return { refreshing, mnemonic };
};

export default NewMnemonicScreen;
