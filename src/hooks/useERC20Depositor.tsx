import { useCallback, useContext } from "react";

import ERC20Asset from "@alice-finance/alice.js/dist/ERC20Asset";
import { ethers } from "ethers";
import { ChainContext } from "../contexts/ChainContext";
import { PendingTransactionsContext } from "../contexts/PendingTransactionsContext";
import useTokenBalanceUpdater from "./useTokenBalanceUpdater";

const useERC20Depositor = (asset: ERC20Asset) => {
    const { ethereumChain } = useContext(ChainContext);
    const { addPendingDepositTransaction, clearPendingDepositTransactions } = useContext(PendingTransactionsContext);
    const { update } = useTokenBalanceUpdater();
    const deposit = useCallback(
        async (amount: ethers.utils.BigNumber) => {
            if (ethereumChain) {
                const assetAddress = asset.ethereumAddress;
                const gateway = ethereumChain.createGateway();
                try {
                    clearPendingDepositTransactions(assetAddress);
                    // Step 1: approve
                    const approveTx = await ethereumChain.approveERC20Async(asset, gateway.address, amount);
                    addPendingDepositTransaction(assetAddress, approveTx);
                    await approveTx.wait();
                    // Step 2: deposit
                    const depositTx = await ethereumChain.depositERC20Async(asset, amount);
                    addPendingDepositTransaction(assetAddress, depositTx);
                    await depositTx.wait();
                    // Done
                    await update();
                    clearPendingDepositTransactions(assetAddress);
                } catch (e) {
                    clearPendingDepositTransactions(assetAddress);
                    throw e;
                }
            }
        },
        [ethereumChain, addPendingDepositTransaction, clearPendingDepositTransactions]
    );
    return { deposit };
};

export default useERC20Depositor;
