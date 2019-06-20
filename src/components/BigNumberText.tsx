import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "react-native";

import { SavingsContext } from "../contexts/SavingsContext";
import preset from "../styles/preset";
import { formatValue } from "../utils/big-number-utils";

const BigNumberText = ({ value, prefix = "", suffix = " ", style = {} }) => {
    const { t } = useTranslation("finance");
    const { asset, decimals } = useContext(SavingsContext);
    return (
        <Text style={[preset.fontSize20, style]}>
            {value ? prefix + formatValue(value, decimals, 2) + suffix || asset!.symbol : t("loading")}
        </Text>
    );
};
export default BigNumberText;
