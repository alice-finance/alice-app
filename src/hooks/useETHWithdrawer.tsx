import React, { useCallback, useContext } from "react";

import Address from "@alice-finance/alice.js/dist/Address";
import { ZERO_ADDRESS } from "@alice-finance/alice.js/dist/constants";
import { ethers } from "ethers";
import { ChainContext } from "../contexts/ChainContext";
import { PendingTransactionsContext } from "../contexts/PendingTransactionsContext";
import Sentry from "../utils/Sentry";
import useAssetBalancesUpdater from "./useAssetBalancesUpdater";

const useETHWithdrawer = () => {
    const { loomChain, ethereumChain } = useContext(ChainContext);
    const { addPendingWithdrawalTransaction, clearPendingWithdrawalTransactions } = useContext(
        PendingTransactionsContext
    );
    const { update } = useAssetBalancesUpdater();
    const withdraw = useCallback(
        async (amount: ethers.utils.BigNumber) => {
            if (loomChain && ethereumChain) {
                const ethereumAddress = Address.createEthereumAddress(ZERO_ADDRESS);
                const gateway = await loomChain.getTransferGatewayAsync();
                try {
                    clearPendingWithdrawalTransactions(ethereumAddress);
                    // Step 1: approve
                    const approveTx = await loomChain.approveETHAsync(gateway.address.local.toChecksumString(), amount);
                    addPendingWithdrawalTransaction(ethereumAddress, approveTx);
                    await approveTx.wait();
                    // Step 2: withdraw from loom network
                    const withdrawTx = await loomChain.withdrawETHAsync(amount, ethereumChain.getGateway().address);
                    addPendingWithdrawalTransaction(ethereumAddress, withdrawTx);
                    await withdrawTx.wait();
                    Sentry.track(Sentry.trackingTopics.ASSET_WITHDRAWN);
                    // Step 3: listen to token withdrawal event
                    const signature = await loomChain.listenToTokenWithdrawal(
                        ethereumChain.getGateway().address,
                        ethereumChain.getAddress().toLocalAddressString()
                    );
                    // Step 4: withdraw from ethereum network
                    const ethereumWithdrawTx = await ethereumChain.withdrawETHAsync(amount, signature);
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

export default useETHWithdrawer;
