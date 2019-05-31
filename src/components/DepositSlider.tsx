import React, { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Slider, StyleSheet, TextInput, View } from "react-native";
import { Dialog, Portal } from "react-native-paper";

import { Button, Text } from "native-base";
import platform from "../../native-base-theme/variables/platform";
import { BalancesContext } from "../contexts/BalancesContext";
import { PendingTransactionsContext } from "../contexts/PendingTransactionsContext";
import ERC20Token from "../evm/ERC20Token";
import Transaction from "../evm/Transaction";
import preset from "../styles/preset";
import { formatValue, parseValue, pow10, toBN } from "../utils/erc20-utils";
import { openTx } from "../utils/ether-scan-utils";
import Spinner from "./Spinner";

const DepositSlider = ({ token }: { token: ERC20Token }) => {
    const { t } = useTranslation("asset");
    const { getPendingDepositTransactions, getPendingWithdrawalTransactions } = useContext(PendingTransactionsContext);
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
    const [depositing, setDepositing] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const amountBN = parseValue(amount.toString(), token.decimals - 2);
    const pendingDepositTransactions = getPendingDepositTransactions(token.loomAddress.toLocalAddressString());
    const pendingWithdrawalTransactions = getPendingWithdrawalTransactions(token.loomAddress.toLocalAddressString());
    const inProgress =
        depositing || withdrawing || pendingDepositTransactions.length > 0 || pendingWithdrawalTransactions.length > 0;
    const max = getBalance(token.loomAddress)
        .add(getBalance(token.ethereumAddress))
        .mul(pow10(2))
        .div(pow10(token.decimals));
    const med = max.div(toBN(2));
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
    const onValueChange = useCallback(value => setAmount(value), []);
    const onUpdateDeposit = useCallback((a: number) => {
        // TODO
    }, []);
    const openDialog = () => setDialogOpen(true);
    const closeDialog = () => setDialogOpen(false);
    return (
        <View style={preset.marginNormal}>
            {inProgress ? (
                <View style={[preset.marginBottomLarge, preset.paddingNormal]}>
                    <DepositInProgress
                        depositing={depositing}
                        pendingDepositTransactions={pendingDepositTransactions}
                    />
                    <WithdrawInProgress
                        withdrawing={withdrawing}
                        pendingWithdrawalTransactions={pendingWithdrawalTransactions}
                    />
                </View>
            ) : (
                <React.Fragment>
                    <View style={[preset.marginNormal, preset.marginBottom0, preset.flexDirectionRow]}>
                        <TextInput
                            selectTextOnFocus={true}
                            keyboardType="numeric"
                            onEndEditing={onEndEditing}
                            style={[preset.textAlignCenter, preset.marginRightSmall, { fontSize: 48 }]}>
                            {formatValue(amount, 2, 2)}
                        </TextInput>
                        <Text style={[preset.alignFlexEnd, preset.marginBottomSmall, preset.fontSize24]}>
                            {token.symbol}
                        </Text>
                    </View>
                    <View style={preset.flex1}>
                        <Slider
                            step={1}
                            value={amount}
                            maximumValue={max.toNumber()}
                            minimumTrackTintColor={platform.brandSuccess}
                            maximumTrackTintColor={platform.brandSuccess}
                            thumbTintColor={platform.brandSuccess}
                            onValueChange={onValueChange}
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
                        success={true}
                        block={true}
                        disabled={getBalance(token.loomAddress).eq(amountBN) || inProgress}
                        style={[preset.marginBottomSmall, preset.marginTopLarge]}
                        onPress={openDialog}>
                        <Text>{t("setDepositAmount")}</Text>
                    </Button>
                </React.Fragment>
            )}
            <Portal>
                <SetDepositAmountDialog
                    visible={dialogOpen}
                    amount={amountBN}
                    token={token}
                    onDismiss={closeDialog}
                    onCancel={closeDialog}
                    onUpdateDeposit={onUpdateDeposit}
                />
            </Portal>
        </View>
    );
};

const DepositInProgress = ({
    depositing,
    pendingDepositTransactions
}: {
    depositing: boolean;
    pendingDepositTransactions: Transaction[];
}) => {
    const { t } = useTranslation("asset");
    const onPress = useCallback(() => openTx(pendingDepositTransactions[pendingDepositTransactions.length - 1].hash), [
        pendingDepositTransactions
    ]);
    return depositing || pendingDepositTransactions.length > 0 ? (
        <View>
            <Spinner compact={true} label={t("depositing") + ` (${pendingDepositTransactions.length}/2)`} />
            <Text style={[preset.colorDanger, preset.marginLarge]}>{t("deposit.description")}</Text>
            {pendingDepositTransactions.length > 0 && (
                <Button bordered={true} onPress={onPress} style={preset.alignCenter}>
                    <Text numberOfLines={1} ellipsizeMode="middle">
                        {t("viewTransaction")}
                    </Text>
                </Button>
            )}
        </View>
    ) : (
        <View />
    );
};

const WithdrawInProgress = ({
    withdrawing,
    pendingWithdrawalTransactions
}: {
    withdrawing: boolean;
    pendingWithdrawalTransactions: Transaction[];
}) => {
    const { t } = useTranslation("asset");
    const onPress = useCallback(
        () => openTx(pendingWithdrawalTransactions[pendingWithdrawalTransactions.length - 1].hash),
        [pendingWithdrawalTransactions]
    );
    return withdrawing || pendingWithdrawalTransactions.length > 0 ? (
        <View>
            <Spinner compact={true} label={t("withdrawing") + ` (${pendingWithdrawalTransactions.length}/3)`} />
            <Text style={[preset.colorDanger, preset.marginLarge]}>{t("withdrawal.description")}</Text>
            {pendingWithdrawalTransactions.length >= 3 && (
                <Button bordered={true} onPress={onPress} style={preset.alignCenter}>
                    <Text numberOfLines={1} ellipsizeMode="middle">
                        {t("viewTransaction")}
                    </Text>
                </Button>
            )}
        </View>
    ) : (
        <View />
    );
};

const SetDepositAmountDialog = ({
    visible,
    onDismiss,
    onCancel,
    onUpdateDeposit,
    amount,
    token
}: {
    visible: boolean;
    onDismiss: () => void;
    onCancel: () => void;
    onUpdateDeposit: (a: number) => void;
    amount: number;
    token: ERC20Token;
}) => {
    const { t } = useTranslation("asset");
    const { getBalance } = useContext(BalancesContext);
    const balance = getBalance(token.loomAddress);
    const change = toBN(amount).sub(balance);
    const changing = formatValue(change, token.decimals) + " " + token.symbol;
    const changed = formatValue(balance.add(change), token.decimals) + " " + token.symbol;
    const onOk = () => onUpdateDeposit(amount);
    return (
        <Dialog visible={visible} onDismiss={onDismiss}>
            <Dialog.Title>
                {formatValue(change.gt(toBN(0)) ? change : change.mul(toBN(-1)), token.decimals)} {token.symbol}{" "}
                {change.gt(toBN(0)) ? t("deposit") : t("withdrawal")}
            </Dialog.Title>
            <Dialog.Content>
                <Text>{t("wouldYouChangeTheDepositAmount")}</Text>
                <View style={[preset.marginTopNormal, preset.marginBottomNormal, styles.border]} />
                <Row label={t("depositChange")} value={changing} />
                <Row label={t("newDepositAmount")} value={changed} />
                <View style={[preset.marginTopNormal, preset.marginBottomNormal, styles.border]} />
                <Text style={[preset.flex0, preset.fontSize14, preset.colorGrey]}>
                    {change.gt(toBN(0)) ? t("deposit.description") : t("withdrawal.description")}
                </Text>
            </Dialog.Content>
            <Dialog.Actions>
                <View style={preset.flexDirectionRow}>
                    <Button rounded={true} block={true} transparent={true} onPress={onCancel}>
                        <Text style={preset.colorPrimary}>{t("cancel")}</Text>
                    </Button>
                    <Button rounded={true} block={true} transparent={true} onPress={onOk}>
                        <Text style={preset.colorPrimary}>{t("ok")}</Text>
                    </Button>
                </View>
            </Dialog.Actions>
        </Dialog>
    );
};

const Row = ({ label, value }) => (
    <View style={[preset.flexDirectionRow, preset.marginTopTiny, preset.marginBottomTiny]}>
        <Text style={[preset.flex0, preset.colorGrey, preset.fontSize14]}>{label}</Text>
        <Text style={[preset.flex1, preset.textAlignRight, preset.fontSize14]}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    scaleText: { flex: 1, color: "darkgrey", fontSize: 12 },
    border: { height: 1, backgroundColor: platform.listDividerBg }
});

export default DepositSlider;
