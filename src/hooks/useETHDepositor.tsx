import React, { useCallback, useContext } from "react";

import Address from "@alice-finance/alice.js/dist/Address";
import { ZERO_ADDRESS } from "@alice-finance/alice.js/dist/constants";
import { ethers } from "ethers";
import { ChainContext } from "../contexts/ChainContext";
import { PendingTransactionsContext } from "../contexts/PendingTransactionsContext";
import Sentry from "../utils/Sentry";
import useAssetBalancesUpdater from "./useAssetBalancesUpdater";

const useETHDepositor = () => {
    const { ethereumChain } = useContext(ChainContext);
    const { addPendingDepositTransaction, clearPendingDepositTransactions } = useContext(PendingTransactionsContext);
    const { update } = useAssetBalancesUpdater();
    const deposit = useCallback(
        async (amount: ethers.utils.BigNumber) => {
            if (ethereumChain) {
                const ethereumAddress = Address.createEthereumAddress(ZERO_ADDRESS);
                try {
                    clearPendingDepositTransactions(ethereumAddress);
                    // Step 1: deposit
                    const tx = await ethereumChain.depositETHAsync(amount);
                    addPendingDepositTransaction(ethereumAddress, tx);
                    await tx.wait();
                    // Done
                    Sentry.track(Sentry.trackingTopics.ASSET_DEPOSITED);
                    await update();
                    clearPendingDepositTransactions(ethereumAddress);
                } catch (e) {
                    clearPendingDepositTransactions(ethereumAddress);
                    Sentry.error(e);
                    throw e;
                }
            }
        },
        [ethereumChain, addPendingDepositTransaction, clearPendingDepositTransactions]
    );
    return { deposit };
};

export default useETHDepositor;
