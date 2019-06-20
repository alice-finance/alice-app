import React, { useCallback, useContext } from "react";

import { ethers } from "ethers";
import { NULL_ADDRESS } from "../constants/token";
import { ConnectorContext } from "../contexts/ConnectorContext";
import { PendingTransactionsContext } from "../contexts/PendingTransactionsContext";
import Address from "../evm/Address";
import useTokenBalanceUpdater from "./useTokenBalanceUpdater";

const useETHDepositor = () => {
    const { ethereumConnector } = useContext(ConnectorContext);
    const { addPendingDepositTransaction, clearPendingDepositTransactions } = useContext(PendingTransactionsContext);
    const { update } = useTokenBalanceUpdater();
    const deposit = useCallback(
        async (amount: ethers.utils.BigNumber) => {
            if (ethereumConnector) {
                const ethereumAddress = Address.newEthereumAddress(NULL_ADDRESS);
                try {
                    clearPendingDepositTransactions(ethereumAddress);
                    // Step 1: approve
                    const gateway = ethereumConnector.getGateway();
                    const tx = await ethereumConnector.wallet.sendTransaction({
                        to: gateway.address,
                        value: amount
                    });
                    addPendingDepositTransaction(ethereumAddress, tx);
                    await tx.wait();
                    // Done
                    await update();
                    clearPendingDepositTransactions(ethereumAddress);
                } catch (e) {
                    clearPendingDepositTransactions(ethereumAddress);
                    throw e;
                }
            }
        },
        [ethereumConnector, addPendingDepositTransaction, clearPendingDepositTransactions]
    );
    return { deposit };
};

export default useETHDepositor;
