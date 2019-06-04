import React, { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Slider, StyleSheet, TextInput, View } from "react-native";

import { Button, Text } from "native-base";
import platform from "../../native-base-theme/variables/platform";
import { BalancesContext } from "../contexts/BalancesContext";
import ERC20Token from "../evm/ERC20Token";
import preset from "../styles/preset";
import { formatValue, parseValue, pow10, toBN } from "../utils/erc20-utils";
import DepositAmountDialog from "./DepositAmountDialog";

const DepositSlider = ({ token }: { token: ERC20Token }) => {
    const { t } = useTranslation("asset");
    const { getBalance } = useContext(BalancesContext);
    const formatAmount = useCallback(
        a =>
            toBN(a)
                .mul(pow10(2))
                .div(pow10(token.decimals))
                .toNumber(),
        [token]
    );
    const [amount, setAmount] = useState(formatAmount(getBalance(token.loomAddress)));
    const amountBN = parseValue(amount.toString(), token.decimals - 2);
    const max = getBalance(token.loomAddress)
        .add(getBalance(token.ethereumAddress))
        .mul(pow10(2))
        .div(pow10(token.decimals));
    const med = max.div(toBN(2));
    const [inProgress, setInProgress] = useState(false); // TODO
    const onEndEditing = useCallback(
        event => {
            let value = parseValue(event.nativeEvent.text, 2);
            if (value.gt(max)) {
                value = max;
            }
            setAmount(value.toNumber());
        },
        [max]
    );
    const [dialogOpen, setDialogOpen] = useState(false);
    const openDialog = () => setDialogOpen(true);
    const closeDialog = () => setDialogOpen(false);
    return (
        <View>
            <View style={[preset.marginNormal, preset.marginBottom0, preset.flexDirectionRow]}>
                <TextInput
                    selectTextOnFocus={true}
                    keyboardType="numeric"
                    onEndEditing={onEndEditing}
                    style={[preset.textAlignCenter, preset.marginRightSmall, { fontSize: 48 }]}>
                    {formatValue(amount, 2, 2)}
                </TextInput>
                <Text style={[preset.alignFlexEnd, preset.marginBottomSmall, preset.fontSize24]}>{token.symbol}</Text>
            </View>
            <View style={[preset.flex1, preset.marginTopSmall, preset.marginBottomSmall]}>
                <Slider
                    step={1}
                    value={amount}
                    maximumValue={max.toNumber()}
                    minimumTrackTintColor={platform.brandInfo}
                    maximumTrackTintColor={platform.brandInfo}
                    thumbTintColor={platform.brandInfo}
                    onValueChange={setAmount}
                    disabled={inProgress}
                />
                <View style={[preset.flexDirectionRow, preset.marginTopSmall]}>
                    <Text style={[styles.scaleText, preset.marginLeftNormal]}>0 {token.symbol}</Text>
                    <Text style={[styles.scaleText, preset.textAlignCenter]}>
                        {formatValue(med, 2, 2)} {token.symbol}
                    </Text>
                    <Text style={[styles.scaleText, preset.textAlignRight, preset.marginRightNormal]}>
                        {formatValue(max, 2, 2)} {token.symbol}
                    </Text>
                </View>
            </View>
            <Button
                info={true}
                block={true}
                disabled={getBalance(token.loomAddress).eq(amountBN) || inProgress}
                style={[preset.marginBottomSmall, preset.marginTopLarge]}
                onPress={openDialog}>
                <Text>{t("setDepositAmount")}</Text>
            </Button>
            <DepositAmountDialog
                visible={dialogOpen}
                amount={amountBN}
                token={token}
                onDismiss={closeDialog}
                onCancel={closeDialog}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    scaleText: { flex: 1, color: "darkgrey", fontSize: 12 },
    border: { height: 1, backgroundColor: platform.listDividerBg }
});

export default DepositSlider;
