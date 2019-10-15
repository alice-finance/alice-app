import { FunctionComponent, useCallback, useState } from "react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { StyleProp, Text, TextInput, TextStyle, View, ViewStyle } from "react-native";

import ERC20Asset from "@alice-finance/alice.js/dist/ERC20Asset";
import { BigNumber } from "ethers/utils";
import platform from "../../../native-base-theme/variables/platform";
import preset from "../../styles/preset";
import { formatValue, parseValue } from "../../utils/big-number-utils";

interface AmountInputProps {
    asset: ERC20Asset;
    max?: BigNumber;
    disabled?: boolean;
    placeholderHidden?: boolean;
    initialValue?: BigNumber;
    onChangeAmount: (amount: BigNumber | null) => void;
    style?: StyleProp<ViewStyle>;
    inputStyle?: StyleProp<TextStyle>;
}

const AmountInput: FunctionComponent<AmountInputProps> = props => {
    const { t } = useTranslation("common");
    const [value, setValue] = useState(props.initialValue ? formatValue(props.initialValue, props.asset.decimals) : "");
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
            <View style={preset.flexDirectionRow}>
                <Input props={props} value={value} onChangeValue={onChangeValue} />
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
            selectTextOnFocus={true}
            keyboardType="numeric"
            placeholder={props.placeholderHidden ? null : props.asset.symbol}
            value={value}
            editable={!props.disabled}
            onChange={onChange}
            style={[
                preset.flex1,
                preset.textAlignRight,
                props.large ? preset.fontSize48 : preset.fontSize36,
                { borderBottomColor: platform.brandLight, borderBottomWidth: 2 },
                props.inputStyle
            ]}
        />
    );
};

export default AmountInput;
