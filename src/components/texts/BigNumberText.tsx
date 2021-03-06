import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "react-native";

import { SavingsContext } from "../../contexts/SavingsContext";
import preset from "../../styles/preset";
import { formatValue } from "../../utils/big-number-utils";

const BigNumberText = ({ value, prefix = "", suffix = " ", decimalPlaces = 4, style = {} }) => {
    const { t } = useTranslation("common");
    const { asset, decimals } = useContext(SavingsContext);
    return (
        <Text style={[preset.fontSize20, style]}>
            {value ? prefix + formatValue(value, decimals, decimalPlaces) + suffix || asset!.symbol : t("loading")}
        </Text>
    );
};
export default BigNumberText;
