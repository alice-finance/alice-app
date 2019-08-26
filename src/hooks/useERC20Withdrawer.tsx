import React, { useCallback, useContext } from "react";

import ERC20Asset from "@alice-finance/alice.js/dist/ERC20Asset";
import { ethers } from "ethers";
import { ChainContext } from "../contexts/ChainContext";
import { PendingTransactionsContext } from "../contexts/PendingTransactionsContext";
import Analytics from "../helpers/Analytics";
import Sentry from "../utils/Sentry";
import useAssetBalancesUpdater from "./useAssetBalancesUpdater";

const useERC20Withdrawer = (asset: ERC20Asset) => {
    const { loomChain, ethereumChain } = useContext(ChainContext);
    const { addPendingWithdrawalTransaction, clearPendingWithdrawalTransactions } = useContext(
        PendingTransactionsContext
    );
    const { update } = useAssetBalancesUpdater();
    const withdraw = useCallback(
        async (amount: ethers.utils.BigNumber) => {
            if (loomChain && ethereumChain) {
                const ethereumAddress = asset.ethereumAddress;
                const gateway = await loomChain.getTransferGatewayAsync();
                try {
                    clearPendingWithdrawalTransactions(ethereumAddress);
                    // Step 1: approve
                    const approveTx = await loomChain.approveERC20Async(
                        asset,
                        gateway.address.local.toChecksumString(),
                        amount
                    );
                    addPendingWithdrawalTransaction(ethereumAddress, approveTx);
                    await approveTx.wait();
                    // Step 2: withdraw from loom network
                    const withdrawTx = await loomChain.withdrawERC20Async(asset, amount);
                    addPendingWithdrawalTransaction(ethereumAddress, withdrawTx);
                    await withdrawTx.wait();
                    Analytics.track(Analytics.events.ASSET_WITHDRAWN);
                    // Step 3: listen to token withdrawal event
                    const signature = await loomChain.listenToTokenWithdrawal(
                        asset.ethereumAddress.toLocalAddressString(),
                        ethereumChain.getAddress().toLocalAddressString()
                    );
                    // Step 4: withdraw from ethereum network
                    const ethereumWithdrawTx = await ethereumChain.withdrawERC20Async(asset, amount, signature);
                    addPendingWithdrawalTransaction(ethereumAddress, ethereumWithdrawTx);
                    await ethereumWithdrawTx.wait();
                    // Done
                    await update();
                } catch (e) {
                    clearPendingWithdrawalTransactions(ethereumAddress);
                    Sentry.error(e);
                    throw e;
                }
            }
        },
        [loomChain, ethereumChain, addPendingWithdrawalTransaction, clearPendingWithdrawalTransactions]
    );
    return { withdraw };
};

export default useERC20Withdrawer;
