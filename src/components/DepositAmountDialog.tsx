import React, { FunctionComponent, useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Dialog, Portal } from "react-native-paper";

import { Button, Text } from "native-base";
import platform from "../../native-base-theme/variables/platform";
import { BalancesContext } from "../contexts/BalancesContext";
import ERC20Token from "../evm/ERC20Token";
import preset from "../styles/preset";
import { formatValue, toBN } from "../utils/erc20-utils";

interface DepositAmountDialogProps {
    visible: boolean;
    onDismiss: () => void;
    onCancel: () => void;
    amount: number;
    token: ERC20Token;
}

const DepositAmountDialog: FunctionComponent<DepositAmountDialogProps> = ({
    visible,
    onDismiss,
    onCancel,
    amount,
    token
}) => {
    const { t } = useTranslation("asset");
    const { getBalance } = useContext(BalancesContext);
    const balance = getBalance(token.loomAddress);
    const change = toBN(amount).sub(balance);
    const changing = formatValue(change, token.decimals) + " " + token.symbol;
    const changed = formatValue(balance.add(change), token.decimals) + " " + token.symbol;
    const onOk = useCallback(() => {
        // TODO
    }, []);
    return (
        <Portal>
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
