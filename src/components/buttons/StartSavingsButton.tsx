import React, { FunctionComponent, useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { StyleProp, ViewStyle } from "react-native";
import { useNavigation } from "react-navigation-hooks";

import { BigNumber } from "ethers/utils";
import { Button, Text, View } from "native-base";
import { ChainContext } from "../../contexts/ChainContext";
import { SavingsContext } from "../../contexts/SavingsContext";
import preset from "../../styles/preset";
import { formatValue } from "../../utils/big-number-utils";
import Sentry from "../../utils/Sentry";

interface StartSavingsButtonProps {
    apr?: BigNumber;
    onPress?: () => void;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
}

const StartSavingsButton: FunctionComponent<StartSavingsButtonProps> = ({ apr, onPress, disabled = false, style }) => {
    const { t } = useTranslation("savings");
    const { push } = useNavigation();
    const { asset } = useContext(SavingsContext);
    const { isReadOnly } = useContext(ChainContext);
    const aprText = apr ? formatValue(apr.mul(100), asset!.decimals, 2) + "%" : null;
    const onStart =
        onPress ||
        useCallback(() => {
            Sentry.track(Sentry.trackingTopics.START_SAVING);
            push(isReadOnly ? "Start" : "NewSavings");
        }, []);
    return (
        <View style={[preset.flex1, style]}>
            <Button
                primary={true}
                rounded={true}
                block={true}
                disabled={disabled}
                onPress={onStart}
                style={preset.flex1}>
                <Text>{aprText ? t("startSavings.button", { aprText }) : t("startSavings.button.withoutApr")}</Text>
            </Button>
            <Text note={true} style={[preset.marginTopSmall, preset.textAlignRight]}>
                {t("startSavings.note")}
            </Text>
        </View>
    );
};

export default StartSavingsButton;
