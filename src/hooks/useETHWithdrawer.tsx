import React, { useCallback, useContext } from "react";

import { BN } from "bn.js";
import { ethers } from "ethers";
import { EthCoin } from "loom-js/dist/contracts";
import { NULL_ADDRESS } from "../constants/token";
import { ConnectorContext } from "../contexts/ConnectorContext";
import { PendingTransactionsContext } from "../contexts/PendingTransactionsContext";
import Address from "../evm/Address";
import { listenToTokenWithdrawal } from "../utils/loom-utils";
import useTokenBalanceUpdater from "./useTokenBalanceUpdater";

const useETHWithdrawer = () => {
    const { loomConnector, ethereumConnector, transferGateway } = useContext(ConnectorContext);
    const { addPendingWithdrawalTransaction, clearPendingWithdrawalTransactions } = useContext(
        PendingTransactionsContext
    );
    const { update } = useTokenBalanceUpdater();
    const withdraw = useCallback(
        async (amount: ethers.utils.BigNumber) => {
            if (loomConnector && ethereumConnector) {
                const ethereumAddress = Address.newEthereumAddress(NULL_ADDRESS);
                try {
                    clearPendingWithdrawalTransactions(ethereumAddress);
                    const eth = await EthCoin.createAsync(loomConnector.client, loomConnector.address);
                    // Step 1: approve
                    addPendingWithdrawalTransaction(ethereumAddress, { hash: "1" });
                    await eth.approveAsync(transferGateway!.address, new BN(amount.toString()));
                    // Step 2: withdraw from loom network
                    addPendingWithdrawalTransaction(ethereumAddress, { hash: "2" });
                    await transferGateway!.withdrawETHAsync(
                        new BN(amount.toString()),
                        Address.newEthereumAddress(ethereumConnector.getGateway().address)
                    );
                    // Step 3: listen to token withdrawal event
                    const ethereumGateway = ethereumConnector!.getGateway();
                    const signature = await listenToTokenWithdrawal(
                        transferGateway!,
                        Address.newEthereumAddress(ethereumGateway.address),
                        ethereumConnector!.address
                    );
                    // Step 4: withdraw from ethereum network
                    const withdrawTx = await ethereumGateway.withdrawETH(amount.toString(), signature);
                    addPendingWithdrawalTransaction(ethereumAddress, withdrawTx);
                    await withdrawTx.wait();
                    await update();
                } catch (e) {
                    clearPendingWithdrawalTransactions(ethereumAddress);
                    throw e;
                }
            }
        },
        [loomConnector, ethereumConnector, addPendingWithdrawalTransaction, clearPendingWithdrawalTransactions]
    );
    return { withdraw };
};

export default useETHWithdrawer;
