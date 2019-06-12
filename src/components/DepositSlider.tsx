import React, { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Slider, StyleSheet, TextInput, View } from "react-native";

import { Button, Text } from "native-base";
import platform from "../../native-base-theme/variables/platform";
import { BalancesContext } from "../contexts/BalancesContext";
import { PendingTransactionsContext } from "../contexts/PendingTransactionsContext";
import ERC20Token from "../evm/ERC20Token";
import useERC20Depositor from "../hooks/useERC20Depositor";
import useETHDepositor from "../hooks/useETHDepositor";
import preset from "../styles/preset";
import { formatValue, parseValue, pow10, toBigNumber } from "../utils/big-number-utils";
import DepositAmountDialog from "./DepositAmountDialog";

const DepositSlider = ({ token }: { token: ERC20Token }) => {
    const { t } = useTranslation("asset");
    const { getBalance } = useContext(BalancesContext);
    const { getPendingDepositTransactions, getPendingWithdrawalTransactions } = useContext(PendingTransactionsContext);
    const formatAmount = a =>
        toBigNumber(a)
            .mul(pow10(2))
            .div(pow10(token.decimals))
            .toNumber();
    const initialAmount = formatAmount(getBalance(token.loomAddress));
    const [amount, setAmount] = useState(initialAmount);
    const amountBN = parseValue(amount.toString(), token.decimals - 2);
    const max = getBalance(token.loomAddress)
        .add(getBalance(token.ethereumAddress))
        .mul(pow10(2))
        .div(pow10(token.decimals));
    const med = max.div(toBigNumber(2));
    const pending =
        getPendingDepositTransactions(token.ethereumAddress).length > 0 ||
        getPendingWithdrawalTransactions(token.ethereumAddress).length > 0;
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
    const [inProgress, setInProgress] = useState(false);
    const openDialog = () => setDialogOpen(true);
    const closeDialog = () => setDialogOpen(false);
    const { deposit: depositETH } = useETHDepositor();
    const { deposit: depositERC20 } = useERC20Depositor(token);
    const onOk = useCallback(() => {
        closeDialog();
        setInProgress(true);
        const change = amountBN.sub(getBalance(token.loomAddress));
        if (change.gt(toBigNumber(0))) {
            if (token.ethereumAddress.isNull()) {
                depositETH(change);
            } else {
                depositERC20(change);
            }
        } else {
            const amountToWithdraw = change.mul(toBigNumber(-1));
            // TODO: Withdraw
        }
        setInProgress(false);
    }, [amountBN, depositETH, depositERC20]);
    return (
        <View>
            <View style={[preset.marginNormal, preset.marginBottom0, preset.flexDirectionRow]}>
                <TextInput
                    selectTextOnFocus={true}
                    keyboardType="numeric"
                    onEndEditing={onEndEditing}
                    style={[preset.textAlignCenter, preset.marginRightSmall, { fontSize: 48 }]}>
                    {formatValue(amount.toString(), 2, 2)}
                </TextInput>
                <Text style={[preset.alignFlexEnd, preset.marginBottomSmall, preset.fontSize24]}>{token.symbol}</Text>
            </View>
            <View style={[preset.flex1, preset.marginTopSmall, preset.marginBottomSmall]}>
                <Slider
                    step={1}
                    value={initialAmount}
                    maximumValue={max.toNumber()}
                    minimumTrackTintColor={platform.brandInfo}
                    maximumTrackTintColor={platform.brandInfo}
                    thumbTintColor={platform.brandInfo}
                    onValueChange={setAmount}
                    disabled={pending || inProgress}
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
                disabled={getBalance(token.loomAddress).eq(toBigNumber(amount)) || pending || inProgress}
                style={[preset.marginBottomSmall, preset.marginTopLarge]}
                onPress={openDialog}>
                <Text>{t("setDepositAmount")}</Text>
            </Button>
            <DepositAmountDialog
                visible={dialogOpen}
                amount={amountBN}
                token={token}
                onOk={onOk}
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
