import React, { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, View } from "react-native";

import { Button, Container, Content, Text } from "native-base";
import MnemonicInput from "../../../components/inputs/MnemonicInput";
import CaptionText from "../../../components/texts/CaptionText";
import SubtitleText from "../../../components/texts/SubtitleText";
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
    return (
        <Container>
            <Content keyboardShouldPersistTaps="handled">
                <SubtitleText aboveText={true}>{t("resetAccount")}</SubtitleText>
                <CaptionText>{t("resetAccount.requirement")}</CaptionText>
                <View style={preset.marginNormal}>
                    <MnemonicInput onChangeMnemonic={onChangeMnemonic} style={preset.marginTopNormal} />
                    {confirmed && <OkButton mnemonic={mnemonic} openDialog={openDialog} />}
                </View>
            </Content>
            <Dialog />
        </Container>
    );
};

const OkButton = ({ mnemonic, openDialog }) => {
    const { t } = useTranslation("common");
    const onComplete = useCallback(async () => {
        Keyboard.dismiss();
        openDialog();
    }, [mnemonic]);
    return (
        <Button block={true} rounded={true} style={preset.marginTopNormal} onPress={onComplete}>
            <Text>{t("ok")}</Text>
        </Button>
    );
};

export default ResetAccountScreen;
