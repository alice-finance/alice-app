import React, { useCallback, useContext } from "react";

import ERC20Asset from "@alice-finance/alice.js/dist/ERC20Asset";
import { ethers } from "ethers";
import { ChainContext } from "../contexts/ChainContext";
import { PendingTransactionsContext } from "../contexts/PendingTransactionsContext";
import useTokenBalanceUpdater from "./useTokenBalanceUpdater";

const useERC20Withdrawer = (asset: ERC20Asset) => {
    const { loomChain, ethereumChain } = useContext(ChainContext);
    const { addPendingWithdrawalTransaction, clearPendingWithdrawalTransactions } = useContext(
        PendingTransactionsContext
    );
    const { update } = useTokenBalanceUpdater();
    const withdraw = useCallback(
        async (amount: ethers.utils.BigNumber) => {
            if (loomChain && ethereumChain) {
                const ethereumAddress = asset.ethereumAddress;
                const gateway = await loomChain.createTransferGatewayAsync();
                try {
                    clearPendingWithdrawalTransactions(ethereumAddress);
                    // Step 1: approve
                    addPendingWithdrawalTransaction(ethereumAddress, { hash: "1" });
                    const approveTx = await loomChain.approveERC20Async(
                        asset,
                        gateway.address.local.toChecksumString(),
                        amount
                    );
                    await approveTx.wait();
                    // Step 2: withdraw from loom network
                    addPendingWithdrawalTransaction(ethereumAddress, { hash: "2" });
                    const withdrawTx = await loomChain.withdrawERC20Async(asset, amount);
                    addPendingWithdrawalTransaction(ethereumAddress, withdrawTx);
                    await withdrawTx.wait();
                    // Step 3: listen to token withdrawal event
                    const signature = await loomChain.listenToTokenWithdrawal(
                        asset.ethereumAddress.toLocalAddressString(),
                        ethereumChain.getAddress().toLocalAddressString()
                    );
                    // Step 4: withdraw from ethereum network
                    const ethereumWithdrawTx = await ethereumChain.withdrawERC20Async(asset, amount, signature);
                    addPendingWithdrawalTransaction(ethereumAddress, ethereumWithdrawTx);
                    await ethereumWithdrawTx.wait();
                    await update();
                } catch (e) {
                    clearPendingWithdrawalTransactions(ethereumAddress);
                    throw e;
                }
            }
        },
        [loomChain, ethereumChain, addPendingWithdrawalTransaction, clearPendingWithdrawalTransactions]
    );
    return { withdraw };
};

export default useERC20Withdrawer;
