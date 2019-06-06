import React, { FunctionComponent, useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Dialog, Portal } from "react-native-paper";

import { ethers } from "ethers";
import { Button, Text } from "native-base";
import platform from "../../native-base-theme/variables/platform";
import { BalancesContext } from "../contexts/BalancesContext";
import ERC20Token from "../evm/ERC20Token";
import useERC20Depositor from "../hooks/useERC20Depositor";
import useETHDepositor from "../hooks/useETHDepositor";
import preset from "../styles/preset";
import { formatValue, toBigNumber } from "../utils/big-number-utils";

interface DepositAmountDialogProps {
    visible: boolean;
    onDismiss: () => void;
    onCancel: () => void;
    amount: ethers.utils.BigNumber;
    token: ERC20Token;
}

const DepositAmountDialog: FunctionComponent<DepositAmountDialogProps> = ({
    visible,
    onDismiss,
    onCancel,
    amount,
    token
}) => {
    const { t } = useTranslation(["asset", "common"]);
    const { getBalance } = useContext(BalancesContext);
    const { deposit: depositETH } = useETHDepositor();
    const { deposit: depositERC20 } = useERC20Depositor(token);
    const balance = getBalance(token.loomAddress);
    const change = amount.sub(balance);
    const changing = formatValue(change, token.decimals, 2) + " " + token.symbol;
    const changed = formatValue(balance.add(change), token.decimals, 2) + " " + token.symbol;
    const onOk = useCallback(() => {
        onDismiss();
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
    }, [change, depositETH, depositERC20]);
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss}>
                <Dialog.Title>
                    {formatValue(change.gt(toBigNumber(0)) ? change : change.mul(toBigNumber(-1)), token.decimals, 2)}{" "}
                    {token.symbol} {change.gt(toBigNumber(0)) ? t("deposit") : t("withdrawal")}
                </Dialog.Title>
                <Dialog.Content>
                    <Text>{t("wouldYouChangeTheDepositAmount")}</Text>
                    <View style={[preset.marginTopNormal, preset.marginBottomNormal, styles.border]} />
                    <Row label={t("depositChange")} value={changing} />
                    <Row label={t("newDepositAmount")} value={changed} />
                    <View style={[preset.marginTopNormal, preset.marginBottomNormal, styles.border]} />
                    <Text style={[preset.flex0, preset.fontSize14, preset.colorGrey]}>
                        {change.gt(toBigNumber(0)) ? t("deposit.description") : t("withdrawal.description")}
                    </Text>
                </Dialog.Content>
                <Dialog.Actions>
                    <View style={preset.flexDirectionRow}>
                        <Button rounded={true} block={true} transparent={true} onPress={onCancel}>
                            <Text style={preset.colorPrimary}>{t("common:cancel")}</Text>
                        </Button>
                        <Button rounded={true} block={true} transparent={true} onPress={onOk}>
                            <Text style={preset.colorPrimary}>{t("common:ok")}</Text>
                        </Button>
                    </View>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

const Row = ({ label, value }) => (
    <View style={[preset.flexDirectionRow, preset.marginTopTiny, preset.marginBottomTiny]}>
        <Text style={[preset.flex0, preset.colorGrey, preset.fontSize14]}>{label}</Text>
        <Text style={[preset.flex1, preset.textAlignRight, preset.fontSize14]}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    border: { height: 1, backgroundColor: platform.listDividerBg }
});

export default DepositAmountDialog;
