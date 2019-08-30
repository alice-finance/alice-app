import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Clipboard, StyleSheet, View } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import { entropyToMnemonic } from "bip39";
import * as Random from "expo-random";
import { Button, Container, Text } from "native-base";
import CaptionText from "../../components/CaptionText";
import MnemonicChip from "../../components/MnemonicChip";
import Spinner from "../../components/Spinner";
import SubtitleText from "../../components/SubtitleText";
import { Spacing } from "../../constants/dimension";
import preset from "../../styles/preset";
import Sentry from "../../utils/Sentry";
import SnackBar from "../../utils/SnackBar";

const NewMnemonicScreen = () => {
    const { t } = useTranslation(["common", "start", "profile"]);
    const { push } = useNavigation();
    const [refreshing, setRefreshing] = useState(true);
    const [mnemonic, setMnemonic] = useState<string>("");
    const onPressConfirm = useCallback(() => {
        Sentry.track(Sentry.trackingTopics.WALLET_CREATED);
        push("ConfirmMnemonic", { mnemonic });
    }, [mnemonic]);
    const onCopy = useCallback(() => {
        Sentry.track(Sentry.trackingTopics.COPY_MNEMONIC);
        Clipboard.setString(mnemonic);
        SnackBar.success(t("profile:seedPhraseCopiedToTheClipboard"));
    }, [mnemonic]);
    useEffect(() => {
        Random.getRandomBytesAsync(16).then(entropy => {
            if (entropy) {
                setMnemonic(entropyToMnemonic(Buffer.from(entropy)));
                setRefreshing(false);
            }
        });
    }, []);
    return (
        <Container style={styles.container}>
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
                        <Button
                            block={true}
                            rounded={true}
                            transparent={true}
                            onPress={onCopy}
                            style={preset.marginTopNormal}>
                            <Text>{t("common:copy")}</Text>
                        </Button>
                        <Button
                            primary={true}
                            block={true}
                            rounded={true}
                            disabled={refreshing}
                            style={preset.marginTopSmall}
                            onPress={onPressConfirm}>
                            <Text>{t("next")}</Text>
                        </Button>
                    </View>
                )}
            </View>
        </Container>
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

export default NewMnemonicScreen;
