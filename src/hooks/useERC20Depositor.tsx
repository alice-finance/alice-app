import { useCallback, useContext } from "react";

import { ethers } from "ethers";
import { ConnectorContext } from "../contexts/ConnectorContext";
import { PendingTransactionsContext } from "../contexts/PendingTransactionsContext";
import ERC20Token from "../evm/ERC20Token";
import useTokenBalanceUpdater from "./useTokenBalanceUpdater";

const useERC20Depositor = (asset: ERC20Token) => {
    const { ethereumConnector } = useContext(ConnectorContext);
    const { addPendingDepositTransaction, clearPendingDepositTransactions } = useContext(PendingTransactionsContext);
    const { update } = useTokenBalanceUpdater();
    const deposit = useCallback(
        async (amount: ethers.utils.BigNumber) => {
            if (ethereumConnector) {
                const assetAddress = asset.ethereumAddress;
                try {
                    clearPendingDepositTransactions(assetAddress);
                    // Step 1: approve
                    const erc20 = ethereumConnector.getERC20(asset.ethereumAddress.toLocalAddressString());
                    const gateway = ethereumConnector.getGateway();
                    const approveTx = await erc20.approve(gateway.address, amount);
                    addPendingDepositTransaction(assetAddress, approveTx);
                    await approveTx.wait();
                    // Step 2: deposit
                    const depositTx = await gateway.depositERC20(amount, asset.ethereumAddress.toLocalAddressString());
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
        [ethereumConnector, addPendingDepositTransaction, clearPendingDepositTransactions]
    );
    return { deposit };
};

export default useERC20Depositor;
