import { useCallback, useContext } from "react";

import ERC20Asset from "@alice-finance/alice.js/dist/ERC20Asset";
import { ethers } from "ethers";
import { ChainContext } from "../contexts/ChainContext";
import { PendingTransactionsContext } from "../contexts/PendingTransactionsContext";
import Analytics from "../helpers/Analytics";
import Sentry from "../utils/Sentry";
import useAssetBalancesUpdater from "./useAssetBalancesUpdater";

const useERC20Depositor = () => {
    const { ethereumChain } = useContext(ChainContext);
    const { addPendingDepositTransaction, clearPendingDepositTransactions } = useContext(PendingTransactionsContext);
    const { update } = useAssetBalancesUpdater();
    const deposit = useCallback(
        async (asset: ERC20Asset, amount: ethers.utils.BigNumber) => {
            if (ethereumChain) {
                const assetAddress = asset.ethereumAddress;
                const gateway = ethereumChain.getGateway();
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
                    Analytics.track(Analytics.events.ASSET_DEPOSITED);
                    await update();
                    clearPendingDepositTransactions(assetAddress);
                } catch (e) {
                    clearPendingDepositTransactions(assetAddress);
                    Sentry.error(e);
                    throw e;
                }
            }
        },
        [ethereumChain, addPendingDepositTransaction, clearPendingDepositTransactions]
    );
    return { deposit };
};

export default useERC20Depositor;
