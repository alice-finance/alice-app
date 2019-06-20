import React, { useCallback, useContext } from "react";

import { BN } from "bn.js";
import { ethers } from "ethers";
import { EthCoin, TransferGateway } from "loom-js/dist/contracts";
import { NULL_ADDRESS } from "../constants/token";
import { ConnectorContext } from "../contexts/ConnectorContext";
import { PendingTransactionsContext } from "../contexts/PendingTransactionsContext";
import Address from "../evm/Address";
import usePendingWithdrawalHandler from "./usePendingWithdrawalHandler";

const useETHWithdrawer = () => {
    const { loomConnector, ethereumConnector } = useContext(ConnectorContext);
    const { addPendingWithdrawalTransaction, clearPendingWithdrawalTransactions } = useContext(
        PendingTransactionsContext
    );
    const { handlePendingWithdrawal } = usePendingWithdrawalHandler();
    const withdraw = useCallback(
        async (amount: ethers.utils.BigNumber) => {
            if (loomConnector && ethereumConnector) {
                const ethereumAddress = Address.newEthereumAddress(NULL_ADDRESS);
                try {
                    clearPendingWithdrawalTransactions(ethereumAddress);
                    const eth = await EthCoin.createAsync(loomConnector.client, loomConnector.address);
                    const gateway = await TransferGateway.createAsync(loomConnector.client, loomConnector.address);
                    // Step 1: approve
                    addPendingWithdrawalTransaction(ethereumAddress, { hash: "1" });
                    await eth.approveAsync(gateway.address, new BN(amount.toString()));
                    // Step 2: withdraw from loom network
                    addPendingWithdrawalTransaction(ethereumAddress, { hash: "2" });
                    await gateway.withdrawETHAsync(
                        new BN(amount.toString()),
                        Address.newEthereumAddress(ethereumConnector.getGateway().address)
                    );
                    // Step 3: withdraw from ethereum network
                    await handlePendingWithdrawal();
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
