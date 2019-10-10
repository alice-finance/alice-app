import React, { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigation } from "react-navigation-hooks";

import { Button, Text } from "native-base";
import { ChainContext } from "../../contexts/ChainContext";
import preset from "../../styles/preset";
import Sentry from "../../utils/Sentry";

const StartSavingsButton = ({ disabled = false }) => {
    const { t } = useTranslation("savings");
    const { push } = useNavigation();
    const { isReadOnly } = useContext(ChainContext);
    const onStart = useCallback(() => {
        Sentry.track(Sentry.trackingTopics.START_SAVING);
        push(isReadOnly ? "Start" : "NewSavings");
    }, []);
    return (
        <Button primary={true} rounded={true} block={true} disabled={disabled} onPress={onStart} style={preset.flex1}>
            <Text style={preset.fontSize16}>{t("startSaving")}</Text>
        </Button>
    );
};

export default StartSavingsButton;
