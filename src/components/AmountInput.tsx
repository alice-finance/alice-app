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
    max?: BigNumber;
    disabled?: boolean;
    placeholderHidden?: boolean;
    initialValue?: string;
    onChangeAmount: (amount: BigNumber | null) => void;
    style?: StyleProp<ViewStyle>;
    inputStyle?: StyleProp<TextStyle>;
}

const AmountInput: FunctionComponent<AmountInputProps> = props => {
    const { t } = useTranslation("finance");
    const [value, setValue] = useState(props.initialValue || "");
    const [error, setError] = useState("");
    const onChangeValue = useCallback(
        (newValue: string) => {
            setValue(newValue);
            const parsedValue = parseValue(newValue, props.asset.decimals);
            const isError = props.max && parsedValue.gt(props.max);
            setError(isError ? t("amountGreaterThanBalance") : "");
            props.onChangeAmount(isError ? null : parsedValue);
        },
        [props.max]
    );
    return (
        <View style={[preset.flexDirectionColumn, props.style]}>
            <View>
                <Input props={props} value={value} onChangeValue={onChangeValue} />
                {props.max && <MaxButton props={props} onChangeValue={onChangeValue} />}
            </View>
            {error.length > 0 && (
                <Text style={[preset.marginNormal, preset.colorDanger, preset.fontSize14]}>{error}</Text>
            )}
        </View>
    );
};

const Input = ({ props, value, onChangeValue }) => {
    const onChange = useCallback(event => {
        const newValue = event.nativeEvent.text;
        onChangeValue(newValue);
    }, []);
    return (
        <TextInput
            autoFocus={true}
            keyboardType="numeric"
            placeholder={props.placeholderHidden ? null : props.asset.symbol}
            value={value}
            editable={!props.disabled}
            onChange={onChange}
            style={[
                preset.fontSize36,
                preset.textAlignRight,
                { borderBottomColor: platform.brandLight, borderBottomWidth: 2 },
                props.inputStyle
            ]}
        />
    );
};

const MaxButton = ({ props, onChangeValue }) => {
    const onPress = useCallback(() => {
        onChangeValue(formatValue(props.max, props.asset.decimals));
    }, [props.max, props.asset]);
    return (
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
            disabled={props.disabled}
            onPress={onPress}>
            <Text style={[props.disabled ? preset.colorGrey : preset.colorInfo, preset.fontSize20]}>MAX</Text>
        </Button>
    );
};

export default AmountInput;
