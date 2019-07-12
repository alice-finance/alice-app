import { FunctionComponent, useCallback, useState } from "react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleProp, Text, TextInput, TextStyle, View, ViewStyle } from "react-native";

import ERC20Asset from "@alice-finance/alice.js/dist/ERC20Asset";
import { BigNumber } from "ethers/utils";
import { Button } from "native-base";
import platform from "../../native-base-theme/variables/platform";
import { Spacing } from "../constants/dimension";
import preset from "../styles/preset";
import { formatValue, parseValue } from "../utils/big-number-utils";

interface AmountInputProps {
    asset: ERC20Asset;
    max: BigNumber;
    disabled?: boolean;
    onChangeAmount: (amount: BigNumber | null) => void;
    style?: StyleProp<ViewStyle>;
    inputStyle?: StyleProp<TextStyle>;
}

const AmountInput: FunctionComponent<AmountInputProps> = ({
    asset,
    max,
    onChangeAmount,
    disabled = false,
    style = {},
    inputStyle = {}
}) => {
    const { t } = useTranslation("finance");
    const [value, setValue] = useState("");
    const [error, setError] = useState("");
    const onChangeValue = (newValue: string) => {
        setValue(newValue);
        const isError = parseValue(newValue, asset!.decimals).gt(max);
        setError(isError ? t("amountGreaterThanBalance") : "");
        onChangeAmount(isError ? null : parseValue(newValue, asset!.decimals));
    };
    const onChange = useCallback(
        event => {
            const newValue = event.nativeEvent.text;
            onChangeValue(newValue);
        },
        [asset, max]
    );
    const onPressMax = useCallback(() => {
        const newValue = formatValue(max, asset!.decimals, 2);
        onChangeValue(newValue);
    }, [asset, max]);
    return (
        <View style={[preset.flexDirectionColumn, style]}>
            <View>
                <TextInput
                    autoFocus={true}
                    keyboardType="numeric"
                    placeholder={asset!.symbol}
                    value={value}
                    editable={!disabled}
                    onChange={onChange}
                    style={[{ borderBottomColor: platform.brandLight, borderBottomWidth: 2, fontSize: 48 }, inputStyle]}
                />
                <Button
                    rounded={true}
                    transparent={true}
                    full={true}
                    style={{
                        padding: Spacing.small,
                        position: "absolute",
                        right: 0,
                        height: "100%",
                        zIndex: 100
                    }}
                    disabled={disabled}
                    onPress={onPressMax}>
                    <Text style={[disabled ? preset.colorGrey : preset.colorInfo, preset.fontSize20]}>MAX</Text>
                </Button>
            </View>
            {error.length > 0 && (
                <Text style={[preset.marginNormal, preset.colorDanger, preset.fontSize14]}>{error}</Text>
            )}
        </View>
    );
};

export default AmountInput;
