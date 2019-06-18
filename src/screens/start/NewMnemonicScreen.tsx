import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Chip } from "react-native-paper";
import { useNavigation } from "react-navigation-hooks";

import { generateMnemonic } from "bip39";
import { Button, Container, Text } from "native-base";
import CaptionText from "../../components/CaptionText";
import Spinner from "../../components/Spinner";
import SubtitleText from "../../components/SubtitleText";
import { Spacing } from "../../constants/dimension";

const NewMnemonicScreen = () => {
    const { t } = useTranslation(["common", "start"]);
    const { push } = useNavigation();
    const [refreshing, setRefreshing] = useState(true);
    const [mnemonic, setMnemonic] = useState<string>("");
    const onPressConfirm = useCallback(() => push("ConfirmMnemonic", { mnemonic }), [mnemonic]);
    useEffect(() => {
        setMnemonic(generateMnemonic());
        setRefreshing(false);
    }, []);
    return (
        <Container style={styles.container}>
            <SubtitleText aboveText={true}>{t("start:newSeedPhrase")}</SubtitleText>
            <CaptionText>{t("start:newSeedPhrase.description")}</CaptionText>
            <View style={styles.content}>
                {refreshing ? (
                    <Spinner />
                ) : (
                    <View>
                        <View style={styles.mnemonic}>
                            {mnemonic.split(" ").map((word, index) => (
                                <Chip mode="flat" key={index} style={styles.chip}>
                                    {word}
                                </Chip>
                            ))}
                        </View>
                        <Button
                            primary={true}
                            block={true}
                            disabled={refreshing}
                            style={styles.button}
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
        flexWrap: "wrap",
        padding: Spacing.normal
    },
    chip: { margin: Spacing.tiny },
    button: { marginTop: Spacing.small }
});

export default NewMnemonicScreen;
