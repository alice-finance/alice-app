import React, { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";

import { BN } from "bn.js";
import { ethers } from "ethers";
import { EthCoin, TransferGateway } from "loom-js/dist/contracts";
import { Toast } from "native-base";
import { NULL_ADDRESS } from "../constants/token";
import { BalancesContext } from "../contexts/BalancesContext";
import { ConnectorContext } from "../contexts/ConnectorContext";
import { PendingTransactionsContext } from "../contexts/PendingTransactionsContext";
import Address from "../evm/Address";

const useETHWithdrawer = () => {
    const { t } = useTranslation("asset");
    const { loomConnector, ethereumConnector } = useContext(ConnectorContext);
    const { addPendingWithdrawalTransaction, clearPendingWithdrawalTransaction } = useContext(
        PendingTransactionsContext
    );
    const { getBalance, updateBalance } = useContext(BalancesContext);
    const withdraw = useCallback(
        async (amount: ethers.utils.BigNumber) => {
            if (loomConnector && ethereumConnector) {
                const ethereumAddress = Address.newEthereumAddress(NULL_ADDRESS);
                const loomAddress = Address.newLoomAddress(NULL_ADDRESS);
                const onError = e => {
                    console.warn(e);
                    clearPendingWithdrawalTransaction(loomAddress);
                    Toast.show({ text: t("depositChangeFailure") });
                };
                try {
                    clearPendingWithdrawalTransaction(loomAddress);
                    addPendingWithdrawalTransaction(loomAddress, { hash: "1" });
                    const eth = await EthCoin.createAsync(loomConnector.client, loomConnector.address);
                    const gateway = await TransferGateway.createAsync(loomConnector.client, loomConnector.address);
                    await eth.approveAsync(gateway.address, new BN(amount.toString()));
                    addPendingWithdrawalTransaction(loomAddress, { hash: "2" });
                    const ethereumGateway = Address.newEthereumAddress(ethereumConnector.getERC20Gateway().address);
                    await gateway.withdrawETHAsync(new BN(amount.toString()), ethereumGateway);
                    clearPendingWithdrawalTransaction(loomAddress);
                    updateBalance(ethereumAddress, getBalance(ethereumAddress).sub(amount));
                    updateBalance(loomAddress, getBalance(loomAddress).add(amount));
                    Toast.show({ text: t("depositChangeSuccess") });
                } catch (e) {
                    onError(e);
                }
            }
        },
        [loomConnector, ethereumConnector, addPendingWithdrawalTransaction, clearPendingWithdrawalTransaction]
    );
    return { withdraw };
};

export default useETHWithdrawer;
