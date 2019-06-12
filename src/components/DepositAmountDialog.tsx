import React, { FunctionComponent, useContext } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Dialog, Portal } from "react-native-paper";

import { ethers } from "ethers";
import { Button, Icon, Text } from "native-base";
import platform from "../../native-base-theme/variables/platform";
import { BalancesContext } from "../contexts/BalancesContext";
import ERC20Token from "../evm/ERC20Token";
import preset from "../styles/preset";
import { formatValue, toBigNumber } from "../utils/big-number-utils";

interface DepositAmountDialogProps {
    visible: boolean;
    onOk: () => void;
    onCancel: () => void;
    amount: ethers.utils.BigNumber;
    token: ERC20Token;
}

const DepositAmountDialog: FunctionComponent<DepositAmountDialogProps> = ({
    visible,
    onOk,
    onCancel,
    amount,
    token
}) => {
    const { t } = useTranslation(["asset", "common"]);
    const { getBalance } = useContext(BalancesContext);
    const balance = getBalance(token.loomAddress);
    const change = amount.sub(balance);
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onCancel}>
                <Dialog.Title>
                    {formatValue(change.gt(toBigNumber(0)) ? change : change.mul(toBigNumber(-1)), token.decimals, 2)}{" "}
                    {token.symbol} {change.gt(toBigNumber(0)) ? t("deposit") : t("withdrawal")}
                </Dialog.Title>
                <Dialog.Content>
                    <Text>{t("wouldYouChangeTheDepositAmount")}</Text>
                    <View style={[preset.marginTopNormal, preset.marginBottomNormal, styles.border]} />
                    <View style={preset.flexDirectionRow}>
                        <Value value={balance} token={token} style={preset.flex1} />
                        <Icon type="SimpleLineIcons" name="arrow-right-circle" style={[preset.alignCenter]} />
                        <Value value={balance.add(change)} token={token} style={preset.flex1} />
                    </View>
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

const Value = ({ token, value, style = {} }) => (
    <Text
        style={[
            preset.textAlignRight,
            preset.fontWeightBold,
            preset.fontSize24,
            preset.textAlignCenter,
            preset.paddingSmall,
            style
        ]}>
        {formatValue(value, token.decimals, 2) + " " + token.symbol}
    </Text>
);

const styles = StyleSheet.create({
    border: { height: 1, backgroundColor: platform.listDividerBg }
});

export default DepositAmountDialog;
