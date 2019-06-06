import React, { FunctionComponent, useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Dialog, Portal } from "react-native-paper";

import BN from "bn.js";
import { Button, Text, Toast } from "native-base";
import platform from "../../native-base-theme/variables/platform";
import { NULL_ADDRESS } from "../constants/token";
import { DEFAULT_GAS_PRICE } from "../constants/web3";
import { BalancesContext } from "../contexts/BalancesContext";
import { PendingTransactionsContext } from "../contexts/PendingTransactionsContext";
import { WalletContext } from "../contexts/WalletContext";
import Address from "../evm/Address";
import ERC20Token from "../evm/ERC20Token";
import preset from "../styles/preset";
import { formatValue, toBN } from "../utils/bn-utils";

interface DepositAmountDialogProps {
    visible: boolean;
    onDismiss: () => void;
    onCancel: () => void;
    amount: BN;
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
    const { deposit: depositERC20 } = useERC20Depositter(token);
    const { deposit: depositETH } = useETHDepositter();
    const balance = getBalance(token.loomAddress);
    const change = amount.sub(balance);
    const changing = formatValue(change, token.decimals, 2) + " " + token.symbol;
    const changed = formatValue(balance.add(change), token.decimals, 2) + " " + token.symbol;
    const onOk = useCallback(() => {
        onDismiss();
        if (change.gt(toBN(0))) {
            if (token.ethereumAddress.isNull()) {
                depositETH(change);
            } else {
                depositERC20(change);
            }
        } else {
            const amountToWithdraw = change.mul(toBN(-1));
            // TODO: Withdraw
        }
    }, [change, depositETH, depositERC20]);
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss}>
                <Dialog.Title>
                    {formatValue(change.gt(toBN(0)) ? change : change.mul(toBN(-1)), token.decimals, 2)} {token.symbol}{" "}
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

const useETHDepositter = () => {
    const { t } = useTranslation("asset");
    const { ethereumWallet } = useContext(WalletContext);
    const { addPendingDepositTransaction, clearPendingDepositTransaction } = useContext(PendingTransactionsContext);
    const deposit = useCallback(
        async (amount: BN) => {
            if (ethereumWallet) {
                const chainId = ethereumWallet.address.chainId;
                const assetAddress = Address.fromString(chainId + ":" + NULL_ADDRESS);
                const onError = e => {
                    clearPendingDepositTransaction(assetAddress);
                    Toast.show({ text: t("depositChangeFailure") });
                };
                try {
                    clearPendingDepositTransaction(assetAddress);
                    const gateway = await ethereumWallet.ERC20Gateway.deployed();
                    const myAddress = ethereumWallet.address.toLocalAddressString();
                    const event = ethereumWallet.send({
                        from: myAddress,
                        to: gateway.address,
                        value: amount.toString(),
                        data: "",
                        gasLimit: 21000,
                        gasPrice: DEFAULT_GAS_PRICE
                    });
                    event.once("transactionHash", hash => {
                        addPendingDepositTransaction(assetAddress, hash);
                    });
                    event.once("receipt", receipt => {
                        clearPendingDepositTransaction(assetAddress);
                    });
                    event.on("error", onError);
                } catch (e) {
                    onError(e);
                }
            }
        },
        [ethereumWallet, addPendingDepositTransaction, clearPendingDepositTransaction]
    );
    return { deposit };
};

const useERC20Depositter = (asset: ERC20Token) => {
    const { t } = useTranslation("asset");
    const { ethereumWallet } = useContext(WalletContext);
    const { addPendingDepositTransaction, clearPendingDepositTransaction } = useContext(PendingTransactionsContext);
    const deposit = useCallback(
        async (amount: BN) => {
            if (ethereumWallet) {
                const assetAddress = asset.ethereumAddress;
                const onError = e => {
                    clearPendingDepositTransaction(assetAddress);
                    Toast.show({ text: t("depositChangeFailure") });
                };
                try {
                    clearPendingDepositTransaction(assetAddress);
                    const erc20 = await ethereumWallet.ERC20.at(asset.ethereumAddress.toLocalAddressString());
                    const gateway = await ethereumWallet.ERC20Gateway.deployed();
                    const approveTx = await erc20.approve(gateway.address, amount.toString());
                    addPendingDepositTransaction(assetAddress, approveTx);
                    await approveTx.wait(1);
                    const depositTx = await gateway.depositERC20(
                        amount.toString(),
                        asset.ethereumAddress.toLocalAddressString()
                    );
                    addPendingDepositTransaction(assetAddress, depositTx);
                    await depositTx.wait(1);
                    clearPendingDepositTransaction(assetAddress);
                } catch (e) {
                    onError(e);
                }
            }
        },
        [ethereumWallet, addPendingDepositTransaction, clearPendingDepositTransaction]
    );
    return { deposit };
};

export default DepositAmountDialog;
