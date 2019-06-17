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
import { listenToTokenWithdrawal } from "../utils/loom-utils";

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
                    clearPendingWithdrawalTransaction(loomAddress);
                    Toast.show({ text: t("depositChangeFailure") });
                };
                try {
                    clearPendingWithdrawalTransaction(loomAddress);
                    // Step 1: approve
                    addPendingWithdrawalTransaction(loomAddress, { hash: "1" });
                    const eth = await EthCoin.createAsync(loomConnector.client, loomConnector.address);
                    const gateway = await TransferGateway.createAsync(loomConnector.client, loomConnector.address);
                    await eth.approveAsync(gateway.address, new BN(amount.toString()));
                    // Step 2: withdraw from loom network
                    addPendingWithdrawalTransaction(loomAddress, { hash: "2" });
                    await gateway.withdrawETHAsync(
                        new BN(amount.toString()),
                        Address.newEthereumAddress(ethereumConnector.getGateway().address)
                    );
                    const signature = await listenToTokenWithdrawal(
                        gateway,
                        ethereumAddress,
                        ethereumConnector.address
                    );
                    // Step 3: withdraw from ethereum network
                    addPendingWithdrawalTransaction(loomAddress, { hash: "3" });
                    const ethereumGateway = ethereumConnector.getGateway();
                    const withdrawTx = await ethereumGateway.withdrawERC20(amount, signature, { gasLimit: 0 });
                    await withdrawTx.wait();
                    // Done
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
