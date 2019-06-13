import { FunctionComponent, useCallback, useState } from "react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { TextInput } from "react-native-paper";

import { BigNumber } from "ethers/utils";
import { Button } from "native-base";
import { Spacing } from "../constants/dimension";
import ERC20Token from "../evm/ERC20Token";
import preset from "../styles/preset";
import { formatValue, parseValue } from "../utils/big-number-utils";

interface AmountInputProps {
    asset: ERC20Token;
    max: BigNumber;
    disabled: boolean;
    onChangeAmount: (amount: BigNumber | null) => void;
    style?: object;
}

const AmountInput: FunctionComponent<AmountInputProps> = ({ asset, max, disabled, onChangeAmount, style = {} }) => {
    const { t } = useTranslation("finance");
    const [value, setValue] = useState("");
    const [error, setError] = useState("");
    const onChange = useCallback(
        event => {
            const newValue = event.nativeEvent.text;
            setValue(newValue);
            const isError = parseValue(newValue, asset!.decimals).gt(max);
            setError(isError ? t("amountGreaterThanBalance") : "");
            onChangeAmount(isError ? null : parseValue(newValue, asset!.decimals));
        },
        [asset, max]
    );
    const onPressMax = useCallback(() => setValue(formatValue(max, asset!.decimals, 2)), [asset, max]);
    return (
        <View style={[preset.flexDirectionColumn, style]}>
            <View>
                <TextInput
                    mode="outlined"
                    keyboardType="numeric"
                    placeholder={asset!.symbol}
                    value={value}
                    disabled={disabled}
                    onChange={onChange}
                />
                <Button
                    rounded={true}
                    transparent={true}
                    full={true}
                    style={{
                        paddingRight: Spacing.small,
                        position: "absolute",
                        right: Spacing.small,
                        bottom: 0,
                        height: 54,
                        zIndex: 100
                    }}
                    disabled={disabled}
                    onPress={onPressMax}>
                    <Text style={{ fontSize: 12 }}>MAX</Text>
                </Button>
            </View>
            {error.length > 0 && (
                <Text style={[preset.marginNormal, preset.colorDanger, preset.fontSize14]}>{error}</Text>
            )}
        </View>
    );
};

export default AmountInput;
