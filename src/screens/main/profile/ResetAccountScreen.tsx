import React, { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, View } from "react-native";

import { Button, Container, Text } from "native-base";
import CaptionText from "../../../components/CaptionText";
import MnemonicInput from "../../../components/MnemonicInput";
import SubtitleText from "../../../components/SubtitleText";
import { ChainContext } from "../../../contexts/ChainContext";
import useResetAccountDialog from "../../../hooks/useResetAccountDialog";
import preset from "../../../styles/preset";

const ResetAccountScreen = () => {
    const { t } = useTranslation(["profile", "common"]);
    const { mnemonic } = useContext(ChainContext);
    const [confirmed, setConfirmed] = useState(false);
    const { Dialog, openDialog } = useResetAccountDialog();
    const onChangeMnemonic = useCallback(
        newMnemonic => {
            setConfirmed(mnemonic === newMnemonic);
        },
        [mnemonic]
    );
    const onComplete = useCallback(async () => {
        if (confirmed) {
            Keyboard.dismiss();
            openDialog();
        }
    }, [confirmed, mnemonic]);
    return (
        <Container>
            <SubtitleText aboveText={true}>{t("resetAccount")}</SubtitleText>
            <CaptionText>{t("resetAccount.requirement")}</CaptionText>
            <View style={preset.marginNormal}>
                <MnemonicInput onChangeMnemonic={onChangeMnemonic} style={preset.marginTopNormal} />
                {confirmed && (
                    <Button
                        block={true}
                        rounded={true}
                        disabled={!confirmed}
                        style={preset.marginTopNormal}
                        onPress={onComplete}>
                        <Text>{t("common:ok")}</Text>
                    </Button>
                )}
            </View>
            <Dialog />
        </Container>
    );
};

export default ResetAccountScreen;
